import { sql } from './db.js';
import { getDeviceId } from './lib/device.js';
import { getOrCreateUser, updateUser } from './lib/user.js';

/** Geçerli UUID string mi kontrol et - client ID'sini korumak için */
const isValidUuid = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
};

/** Map frontend format to DB format and vice versa */
const toDbHabit = (h, userId) => ({
  id: h.id,
  title: h.title,
  frequency: h.frequency || 'daily',
  streak: h.streak ?? 0,
  target_period: h.targetPerPeriod ?? null,
  completed_dates: JSON.stringify(h.completedDates || []),
});

const fromDbHabit = (r) => ({
  id: r.id,
  title: r.title,
  frequency: r.frequency,
  streak: Number(r.streak) || 0,
  targetPerPeriod: r.target_period,
  completedDates: Array.isArray(r.completed_dates) ? r.completed_dates : (r.completed_dates ? JSON.parse(r.completed_dates) : []),
});

const toDbTask = (t, userId) => ({
  id: t.id,
  text: t.text,
  completed: !!t.completed,
  tag: t.tag || 'Genel',
  priority: t.priority || 'low',
  repeat: t.repeat || 'none',
  subtasks: JSON.stringify(t.subtasks || []),
});

const fromDbTask = (r) => ({
  id: r.id,
  text: r.text,
  completed: !!r.completed,
  tag: r.tag,
  priority: r.priority,
  repeat: r.repeat,
  subtasks: Array.isArray(r.subtasks) ? r.subtasks : (r.subtasks ? JSON.parse(r.subtasks) : []),
});

const toDbGoal = (g, userId) => ({
  id: g.id,
  title: g.title,
  current: Number(g.current) || 0,
  target: Number(g.target) || 0,
  unit: g.unit || '',
});

const fromDbGoal = (r) => ({
  id: r.id,
  title: r.title,
  current: Number(r.current) || 0,
  target: Number(r.target) || 0,
  unit: r.unit || '',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Device-ID');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const deviceId = getDeviceId(req);
  if (!deviceId) {
    return res.status(400).json({ error: 'device_id gerekli (header: X-Device-ID veya query/body)' });
  }

  try {
    const user = await getOrCreateUser(deviceId);
    const userId = user.id;

    if (req.method === 'GET') {
      // Fetch all data for user
      const [habitsRows, tasksRows, goalsRows, taskLogsRows, lessonsRows, templatesRows, studentsRows, expensesRows, waterRows, coffeeRows, workoutRows, recipesRows, mealRows] = await Promise.all([
        sql`SELECT * FROM habits WHERE user_id = ${userId}`,
        sql`SELECT * FROM tasks WHERE user_id = ${userId}`,
        sql`SELECT * FROM goals WHERE user_id = ${userId}`,
        sql`SELECT date, count FROM task_logs WHERE user_id = ${userId}`,
        sql`SELECT * FROM lessons WHERE user_id = ${userId}`,
        sql`SELECT * FROM lesson_templates WHERE user_id = ${userId}`,
        sql`SELECT * FROM students WHERE user_id = ${userId}`,
        sql`SELECT * FROM expenses WHERE user_id = ${userId}`,
        sql`SELECT date, count FROM water_logs WHERE user_id = ${userId}`,
        sql`SELECT date, count FROM coffee_logs WHERE user_id = ${userId}`,
        sql`SELECT * FROM workout_logs WHERE user_id = ${userId}`,
        sql`SELECT * FROM recipes WHERE user_id = ${userId}`,
        sql`SELECT * FROM meal_logs WHERE user_id = ${userId}`,
      ]);

      const taskLogs = [];
      taskLogsRows.forEach((r) => {
        const count = Number(r.count) || 1;
        for (let i = 0; i < count; i++) taskLogs.push(r.date);
      });

      const waterLogs = {};
      waterRows.forEach((r) => { waterLogs[r.date] = Number(r.count) || 0; });

      const coffeeLogs = {};
      coffeeRows.forEach((r) => { coffeeLogs[r.date] = Number(r.count) || 0; });

      const lessons = lessonsRows.map((l) => ({
        id: l.id,
        date: l.date,
        studentName: l.student_name,
        subject: l.subject,
        time: l.time,
        duration: l.duration,
        fee: l.fee ? String(l.fee) : '',
        notes: l.notes || '',
        cancelled: !!l.cancelled,
        paymentDone: !!l.payment_done,
        parentInformed: !!l.parent_informed,
        studentAttended: !!l.student_attended,
        postLessonNotes: l.post_lesson_notes || '',
      }));

      const lessonTemplates = templatesRows.map((t) => ({
        id: t.id,
        studentName: t.student_name,
        subject: t.subject,
        day: t.day,
        time: t.time,
        duration: t.duration,
        fee: t.fee ? String(t.fee) : '',
        notes: t.notes || '',
      }));

      const students = studentsRows.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone || '',
        email: s.email || '',
        parentName: s.parent_name || '',
        parentPhone: s.parent_phone || '',
        notes: s.notes || '',
      }));

      const expenses = expensesRows.map((e) => ({
        id: e.id,
        date: e.date,
        category: e.category,
        amount: e.amount,
        description: e.description || '',
      }));

      const workoutLogs = workoutRows.map((w) => ({
        id: w.id,
        date: w.date,
        type: w.type,
        duration: w.duration,
        notes: w.notes || '',
      }));

      const recipes = recipesRows.map((r) => ({
        id: r.id,
        title: r.title,
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : (r.ingredients ? JSON.parse(r.ingredients) : []),
        instructions: Array.isArray(r.instructions) ? r.instructions : (r.instructions ? JSON.parse(r.instructions) : []),
        prepTime: r.prep_time,
        cookTime: r.cook_time,
        servings: r.servings,
        category: r.category,
      }));

      const mealLogs = mealRows.map((m) => ({
        id: m.id,
        date: m.date,
        mealType: m.meal_type,
        description: m.description,
        recipeId: m.recipe_id,
      }));

      return res.status(200).json({
        user: {
          userName: user.user_name,
          theme: user.theme,
          xp: user.xp,
          level: user.level,
          leftLayout: user.left_layout ? (Array.isArray(user.left_layout) ? user.left_layout : JSON.parse(user.left_layout)) : null,
          rightLayout: user.right_layout ? (Array.isArray(user.right_layout) ? user.right_layout : JSON.parse(user.right_layout)) : null,
        },
        habits: habitsRows.map(fromDbHabit),
        tasks: tasksRows.map(fromDbTask),
        taskLogs,
        goals: goalsRows.map(fromDbGoal),
        lessons,
        lessonTemplates,
        students,
        expenses,
        waterLogs,
        coffeeLogs,
        workoutLogs,
        recipes,
        mealLogs,
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

      await updateUser(userId, {
        user_name: body.userName,
        theme: body.theme,
        xp: body.userStats?.xp,
        level: body.userStats?.level,
        left_layout: body.leftLayout,
        right_layout: body.rightLayout,
      });

      await sql`DELETE FROM habits WHERE user_id = ${userId}`;
      if (Array.isArray(body.habits)) {
        for (const h of body.habits) {
          const d = toDbHabit(h, userId);
          if (isValidUuid(h.id)) {
            await sql`INSERT INTO habits (id, user_id, title, frequency, streak, target_period, completed_dates)
              VALUES (${h.id}, ${userId}, ${d.title}, ${d.frequency}, ${d.streak}, ${d.target_period}, ${d.completed_dates}::jsonb)`;
          } else {
            await sql`INSERT INTO habits (user_id, title, frequency, streak, target_period, completed_dates)
              VALUES (${userId}, ${d.title}, ${d.frequency}, ${d.streak}, ${d.target_period}, ${d.completed_dates}::jsonb)`;
          }
        }
      }

      await sql`DELETE FROM tasks WHERE user_id = ${userId}`;
      if (Array.isArray(body.tasks)) {
        for (const t of body.tasks) {
          const d = toDbTask(t, userId);
          if (isValidUuid(t.id)) {
            await sql`INSERT INTO tasks (id, user_id, text, completed, tag, priority, repeat, subtasks)
              VALUES (${t.id}, ${userId}, ${d.text}, ${d.completed}, ${d.tag}, ${d.priority}, ${d.repeat}, ${d.subtasks}::jsonb)`;
          } else {
            await sql`INSERT INTO tasks (user_id, text, completed, tag, priority, repeat, subtasks)
              VALUES (${userId}, ${d.text}, ${d.completed}, ${d.tag}, ${d.priority}, ${d.repeat}, ${d.subtasks}::jsonb)`;
          }
        }
      }

      await sql`DELETE FROM goals WHERE user_id = ${userId}`;
      if (Array.isArray(body.goals)) {
        for (const g of body.goals) {
          const d = toDbGoal(g, userId);
          if (isValidUuid(g.id)) {
            await sql`INSERT INTO goals (id, user_id, title, current, target, unit)
              VALUES (${g.id}, ${userId}, ${d.title}, ${d.current}, ${d.target}, ${d.unit})`;
          } else {
            await sql`INSERT INTO goals (user_id, title, current, target, unit)
              VALUES (${userId}, ${d.title}, ${d.current}, ${d.target}, ${d.unit})`;
          }
        }
      }

      // Task logs: group by date, count
      await sql`DELETE FROM task_logs WHERE user_id = ${userId}`;
      if (Array.isArray(body.taskLogs)) {
        const byDate = {};
        body.taskLogs.forEach((d) => { byDate[d] = (byDate[d] || 0) + 1; });
        for (const [date, count] of Object.entries(byDate)) {
          await sql`
            INSERT INTO task_logs (user_id, date, count) VALUES (${userId}, ${date}, ${count})
          `;
        }
      }

      await sql`DELETE FROM lessons WHERE user_id = ${userId}`;
      if (Array.isArray(body.lessons)) {
        for (const l of body.lessons) {
          const feeVal = l.fee ? parseInt(String(l.fee).replace(/\D/g, ''), 10) : null;
          if (isValidUuid(l.id)) {
            await sql`INSERT INTO lessons (id, user_id, date, student_name, subject, time, duration, fee, notes, cancelled, payment_done, parent_informed, student_attended, post_lesson_notes)
              VALUES (${l.id}, ${userId}, ${l.date}, ${l.studentName}, ${l.subject}, ${l.time || '14:00'}, ${l.duration || 60}, ${feeVal}, ${l.notes || ''}, ${!!l.cancelled}, ${!!l.paymentDone}, ${!!l.parentInformed}, ${!!l.studentAttended}, ${l.postLessonNotes || ''})`;
          } else {
            await sql`INSERT INTO lessons (user_id, date, student_name, subject, time, duration, fee, notes, cancelled, payment_done, parent_informed, student_attended, post_lesson_notes)
              VALUES (${userId}, ${l.date}, ${l.studentName}, ${l.subject}, ${l.time || '14:00'}, ${l.duration || 60}, ${feeVal}, ${l.notes || ''}, ${!!l.cancelled}, ${!!l.paymentDone}, ${!!l.parentInformed}, ${!!l.studentAttended}, ${l.postLessonNotes || ''})`;
          }
        }
      }

      await sql`DELETE FROM lesson_templates WHERE user_id = ${userId}`;
      if (Array.isArray(body.lessonTemplates)) {
        for (const t of body.lessonTemplates) {
          const feeVal = t.fee ? parseInt(String(t.fee).replace(/\D/g, ''), 10) : null;
          if (isValidUuid(t.id)) {
            await sql`INSERT INTO lesson_templates (id, user_id, student_name, subject, day, time, duration, fee, notes)
              VALUES (${t.id}, ${userId}, ${t.studentName}, ${t.subject}, ${t.day || 'Pazartesi'}, ${t.time || '14:00'}, ${t.duration || 60}, ${feeVal}, ${t.notes || ''})`;
          } else {
            await sql`INSERT INTO lesson_templates (user_id, student_name, subject, day, time, duration, fee, notes)
              VALUES (${userId}, ${t.studentName}, ${t.subject}, ${t.day || 'Pazartesi'}, ${t.time || '14:00'}, ${t.duration || 60}, ${feeVal}, ${t.notes || ''})`;
          }
        }
      }

      await sql`DELETE FROM students WHERE user_id = ${userId}`;
      if (Array.isArray(body.students)) {
        for (const s of body.students) {
          if (isValidUuid(s.id)) {
            await sql`INSERT INTO students (id, user_id, name, phone, email, parent_name, parent_phone, notes)
              VALUES (${s.id}, ${userId}, ${s.name}, ${s.phone || ''}, ${s.email || ''}, ${s.parentName || ''}, ${s.parentPhone || ''}, ${s.notes || ''})`;
          } else {
            await sql`INSERT INTO students (user_id, name, phone, email, parent_name, parent_phone, notes)
              VALUES (${userId}, ${s.name}, ${s.phone || ''}, ${s.email || ''}, ${s.parentName || ''}, ${s.parentPhone || ''}, ${s.notes || ''})`;
          }
        }
      }

      await sql`DELETE FROM expenses WHERE user_id = ${userId}`;
      if (Array.isArray(body.expenses)) {
        for (const e of body.expenses) {
          if (isValidUuid(e.id)) {
            await sql`INSERT INTO expenses (id, user_id, date, category, amount, description)
              VALUES (${e.id}, ${userId}, ${e.date}, ${e.category}, ${e.amount}, ${e.description || ''})`;
          } else {
            await sql`INSERT INTO expenses (user_id, date, category, amount, description)
              VALUES (${userId}, ${e.date}, ${e.category}, ${e.amount}, ${e.description || ''})`;
          }
        }
      }

      await sql`DELETE FROM water_logs WHERE user_id = ${userId}`;
      if (body.waterLogs && typeof body.waterLogs === 'object') {
        for (const [date, count] of Object.entries(body.waterLogs)) {
          if (count > 0) {
            await sql`INSERT INTO water_logs (user_id, date, count) VALUES (${userId}, ${date}, ${count})`;
          }
        }
      }

      await sql`DELETE FROM coffee_logs WHERE user_id = ${userId}`;
      if (body.coffeeLogs && typeof body.coffeeLogs === 'object') {
        for (const [date, count] of Object.entries(body.coffeeLogs)) {
          if (count > 0) {
            await sql`INSERT INTO coffee_logs (user_id, date, count) VALUES (${userId}, ${date}, ${count})`;
          }
        }
      }

      await sql`DELETE FROM workout_logs WHERE user_id = ${userId}`;
      if (Array.isArray(body.workoutLogs)) {
        for (const w of body.workoutLogs) {
          if (isValidUuid(w.id)) {
            await sql`INSERT INTO workout_logs (id, user_id, date, type, duration, notes)
              VALUES (${w.id}, ${userId}, ${w.date}, ${w.type}, ${w.duration || 30}, ${w.notes || ''})`;
          } else {
            await sql`INSERT INTO workout_logs (user_id, date, type, duration, notes)
              VALUES (${userId}, ${w.date}, ${w.type}, ${w.duration || 30}, ${w.notes || ''})`;
          }
        }
      }

      await sql`DELETE FROM recipes WHERE user_id = ${userId}`;
      if (Array.isArray(body.recipes)) {
        for (const r of body.recipes) {
          if (isValidUuid(r.id)) {
            await sql`INSERT INTO recipes (id, user_id, title, ingredients, instructions, prep_time, cook_time, servings, category)
              VALUES (${r.id}, ${userId}, ${r.title}, ${JSON.stringify(r.ingredients || [])}::jsonb, ${JSON.stringify(r.instructions || [])}::jsonb, ${r.prepTime || null}, ${r.cookTime || null}, ${r.servings || null}, ${r.category || null})`;
          } else {
            await sql`INSERT INTO recipes (user_id, title, ingredients, instructions, prep_time, cook_time, servings, category)
              VALUES (${userId}, ${r.title}, ${JSON.stringify(r.ingredients || [])}::jsonb, ${JSON.stringify(r.instructions || [])}::jsonb, ${r.prepTime || null}, ${r.cookTime || null}, ${r.servings || null}, ${r.category || null})`;
          }
        }
      }

      await sql`DELETE FROM meal_logs WHERE user_id = ${userId}`;
      if (Array.isArray(body.mealLogs)) {
        for (const m of body.mealLogs) {
          const recipeIdVal = isValidUuid(m.recipeId) ? m.recipeId : null;
          if (isValidUuid(m.id)) {
            await sql`INSERT INTO meal_logs (id, user_id, date, meal_type, description, recipe_id)
              VALUES (${m.id}, ${userId}, ${m.date}, ${m.mealType}, ${m.description}, ${recipeIdVal})`;
          } else {
            await sql`INSERT INTO meal_logs (user_id, date, meal_type, description, recipe_id)
              VALUES (${userId}, ${m.date}, ${m.mealType}, ${m.description}, ${recipeIdVal})`;
          }
        }
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: err.message });
  }
}
