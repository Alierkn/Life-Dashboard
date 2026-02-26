import { sql } from './db.js';
import { getDeviceId } from './lib/device.js';
import { getOrCreateUser, updateUser } from './lib/user.js';

/** ISO veya kısa tarihi YYYY-MM-DD'e çevirir */
const toDateKey = (d) => {
  if (d == null) return '';
  const s = String(d).trim();
  return s.includes('T') ? s.split('T')[0] : s;
};

/** Geçerli UUID string mi kontrol et - client ID'sini korumak için */
const isValidUuid = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
};

/** Map frontend format to DB format and vice versa */
const toDbHabit = (h, userId) => ({
  id: h.id,
  user_id: userId,
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
  user_id: userId,
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
  user_id: userId,
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
        const key = toDateKey(r.date);
        for (let i = 0; i < count; i++) taskLogs.push(key);
      });

      const waterLogs = {};
      waterRows.forEach((r) => { waterLogs[toDateKey(r.date)] = Number(r.count) || 0; });

      const coffeeLogs = {};
      coffeeRows.forEach((r) => { coffeeLogs[toDateKey(r.date)] = Number(r.count) || 0; });

      const lessons = lessonsRows.map((l) => ({
        id: l.id,
        date: toDateKey(l.date),
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
        date: toDateKey(e.date),
        category: e.category,
        amount: e.amount,
        description: e.description || '',
      }));

      const workoutLogs = workoutRows.map((w) => ({
        id: w.id,
        date: toDateKey(w.date),
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
        date: toDateKey(m.date),
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

      // ---- SAFE UPSERT STRATEGY (Deleting only missing items is safer, but simplest safe way is Upsert one by one) ----
      // To properly sync without deleting everything, we should use INSERT ... ON CONFLICT UPDATE
      // For simplicity in this environment without complex sync logic (timestamps), we will use UPSERT on ID.
      // NOTE: This does not delete items removed on client.
      // To handle deletions, we can either:
      // 1. Send deleted IDs from client (best)
      // 2. Or get all server IDs, compare with client IDs, and delete missing (risky if client has partial data)
      // Given the current architecture, we will implement UPSERT for incoming data.
      // *** CRITICAL CHANGE: We are NOT deleting all data anymore. ***

      // --- HABITS ---
      // Get existing IDs first to detect deletions
      const existingHabits = await sql`SELECT id FROM habits WHERE user_id = ${userId}`;
      const existingHabitIds = new Set(existingHabits.map(h => h.id));
      const incomingHabitIds = new Set();

      if (Array.isArray(body.habits)) {
        for (const h of body.habits) {
          if (!isValidUuid(h.id)) continue;
          incomingHabitIds.add(h.id);
          const d = toDbHabit(h, userId);
          // SECURITY FIX: Ensure WHERE clause in UPDATE prevents modifying other users' data
          await sql`
            INSERT INTO habits (id, user_id, title, frequency, streak, target_period, completed_dates)
            VALUES (${d.id}, ${userId}, ${d.title}, ${d.frequency}, ${d.streak}, ${d.target_period}, ${d.completed_dates}::jsonb)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              frequency = EXCLUDED.frequency,
              streak = EXCLUDED.streak,
              target_period = EXCLUDED.target_period,
              completed_dates = EXCLUDED.completed_dates
            WHERE habits.user_id = ${userId}
          `;
        }
      }
      // Delete missing
      for (const id of existingHabitIds) {
        if (!incomingHabitIds.has(id)) {
          await sql`DELETE FROM habits WHERE id = ${id} AND user_id = ${userId}`;
        }
      }


      // --- TASKS ---
      const existingTasks = await sql`SELECT id FROM tasks WHERE user_id = ${userId}`;
      const existingTaskIds = new Set(existingTasks.map(t => t.id));
      const incomingTaskIds = new Set();

      if (Array.isArray(body.tasks)) {
        for (const t of body.tasks) {
          if (!isValidUuid(t.id)) continue;
          incomingTaskIds.add(t.id);
          const d = toDbTask(t, userId);
          await sql`
            INSERT INTO tasks (id, user_id, text, completed, tag, priority, repeat, subtasks)
            VALUES (${d.id}, ${userId}, ${d.text}, ${d.completed}, ${d.tag}, ${d.priority}, ${d.repeat}, ${d.subtasks}::jsonb)
            ON CONFLICT (id) DO UPDATE SET
              text = EXCLUDED.text,
              completed = EXCLUDED.completed,
              tag = EXCLUDED.tag,
              priority = EXCLUDED.priority,
              repeat = EXCLUDED.repeat,
              subtasks = EXCLUDED.subtasks
            WHERE tasks.user_id = ${userId}
          `;
        }
      }
      for (const id of existingTaskIds) {
        if (!incomingTaskIds.has(id)) {
          await sql`DELETE FROM tasks WHERE id = ${id} AND user_id = ${userId}`;
        }
      }

      // --- GOALS ---
      const existingGoals = await sql`SELECT id FROM goals WHERE user_id = ${userId}`;
      const existingGoalIds = new Set(existingGoals.map(g => g.id));
      const incomingGoalIds = new Set();

      if (Array.isArray(body.goals)) {
        for (const g of body.goals) {
          if (!isValidUuid(g.id)) continue;
          incomingGoalIds.add(g.id);
          const d = toDbGoal(g, userId);
          await sql`
            INSERT INTO goals (id, user_id, title, current, target, unit)
            VALUES (${d.id}, ${userId}, ${d.title}, ${d.current}, ${d.target}, ${d.unit})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              current = EXCLUDED.current,
              target = EXCLUDED.target,
              unit = EXCLUDED.unit
            WHERE goals.user_id = ${userId}
          `;
        }
      }
      for (const id of existingGoalIds) {
        if (!incomingGoalIds.has(id)) {
          await sql`DELETE FROM goals WHERE id = ${id} AND user_id = ${userId}`;
        }
      }

      // --- TASK LOGS (Still tricky without IDs, but we can replace based on date if needed, or append) ---
      // For logs, simple count per date. We can use UPSERT on (user_id, date) if there is a unique constraint.
      // Assuming (user_id, date) is unique in DB schema for task_logs:
      if (Array.isArray(body.taskLogs)) {
        const byDate = {};
        body.taskLogs.forEach((d) => { byDate[d] = (byDate[d] || 0) + 1; });
        for (const [date, count] of Object.entries(byDate)) {
             // Try UPSERT if constraint exists, otherwise DELETE for that day and INSERT (safer than global delete)
             // We'll assume a DELETE for that specific date is safe enough for logs.
             await sql`DELETE FROM task_logs WHERE user_id = ${userId} AND date = ${date}`;
             await sql`INSERT INTO task_logs (user_id, date, count) VALUES (${userId}, ${date}, ${count})`;
        }
      }

      // --- LESSONS ---
      const existingLessons = await sql`SELECT id FROM lessons WHERE user_id = ${userId}`;
      const existingLessonIds = new Set(existingLessons.map(l => l.id));
      const incomingLessonIds = new Set();

      if (Array.isArray(body.lessons)) {
        for (const l of body.lessons) {
          if (!isValidUuid(l.id)) continue;
          incomingLessonIds.add(l.id);
          const feeVal = l.fee ? parseInt(String(l.fee).replace(/\D/g, ''), 10) : null;
          const dateVal = toDateKey(l.date);

          await sql`
            INSERT INTO lessons (id, user_id, date, student_name, subject, time, duration, fee, notes, cancelled, payment_done, parent_informed, student_attended, post_lesson_notes)
            VALUES (${l.id}, ${userId}, ${dateVal}, ${l.studentName}, ${l.subject}, ${l.time || '14:00'}, ${l.duration || 60}, ${feeVal}, ${l.notes || ''}, ${!!l.cancelled}, ${!!l.paymentDone}, ${!!l.parentInformed}, ${!!l.studentAttended}, ${l.postLessonNotes || ''})
            ON CONFLICT (id) DO UPDATE SET
              date = EXCLUDED.date,
              student_name = EXCLUDED.student_name,
              subject = EXCLUDED.subject,
              time = EXCLUDED.time,
              duration = EXCLUDED.duration,
              fee = EXCLUDED.fee,
              notes = EXCLUDED.notes,
              cancelled = EXCLUDED.cancelled,
              payment_done = EXCLUDED.payment_done,
              parent_informed = EXCLUDED.parent_informed,
              student_attended = EXCLUDED.student_attended,
              post_lesson_notes = EXCLUDED.post_lesson_notes
            WHERE lessons.user_id = ${userId}
          `;
        }
      }
      for (const id of existingLessonIds) {
        if (!incomingLessonIds.has(id)) {
          await sql`DELETE FROM lessons WHERE id = ${id} AND user_id = ${userId}`;
        }
      }

      // --- LESSON TEMPLATES ---
      const existingTemplates = await sql`SELECT id FROM lesson_templates WHERE user_id = ${userId}`;
      const existingTemplateIds = new Set(existingTemplates.map(t => t.id));
      const incomingTemplateIds = new Set();

      if (Array.isArray(body.lessonTemplates)) {
        for (const t of body.lessonTemplates) {
          if (!isValidUuid(t.id)) continue;
          incomingTemplateIds.add(t.id);
          const feeVal = t.fee ? parseInt(String(t.fee).replace(/\D/g, ''), 10) : null;
          await sql`
            INSERT INTO lesson_templates (id, user_id, student_name, subject, day, time, duration, fee, notes)
            VALUES (${t.id}, ${userId}, ${t.studentName}, ${t.subject}, ${t.day || 'Pazartesi'}, ${t.time || '14:00'}, ${t.duration || 60}, ${feeVal}, ${t.notes || ''})
            ON CONFLICT (id) DO UPDATE SET
              student_name = EXCLUDED.student_name,
              subject = EXCLUDED.subject,
              day = EXCLUDED.day,
              time = EXCLUDED.time,
              duration = EXCLUDED.duration,
              fee = EXCLUDED.fee,
              notes = EXCLUDED.notes
            WHERE lesson_templates.user_id = ${userId}
          `;
        }
      }
      for (const id of existingTemplateIds) {
        if (!incomingTemplateIds.has(id)) {
          await sql`DELETE FROM lesson_templates WHERE id = ${id} AND user_id = ${userId}`;
        }
      }


      // --- STUDENTS ---
      const existingStudents = await sql`SELECT id FROM students WHERE user_id = ${userId}`;
      const existingStudentIds = new Set(existingStudents.map(s => s.id));
      const incomingStudentIds = new Set();

      if (Array.isArray(body.students)) {
        for (const s of body.students) {
          if (!isValidUuid(s.id)) continue;
          incomingStudentIds.add(s.id);
          await sql`
            INSERT INTO students (id, user_id, name, phone, email, parent_name, parent_phone, notes)
            VALUES (${s.id}, ${userId}, ${s.name}, ${s.phone || ''}, ${s.email || ''}, ${s.parentName || ''}, ${s.parentPhone || ''}, ${s.notes || ''})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              email = EXCLUDED.email,
              parent_name = EXCLUDED.parent_name,
              parent_phone = EXCLUDED.parent_phone,
              notes = EXCLUDED.notes
            WHERE students.user_id = ${userId}
          `;
        }
      }
      for (const id of existingStudentIds) {
        if (!incomingStudentIds.has(id)) {
          await sql`DELETE FROM students WHERE id = ${id} AND user_id = ${userId}`;
        }
      }

      // --- EXPENSES ---
      const existingExpenses = await sql`SELECT id FROM expenses WHERE user_id = ${userId}`;
      const existingExpenseIds = new Set(existingExpenses.map(e => e.id));
      const incomingExpenseIds = new Set();

      if (Array.isArray(body.expenses)) {
        for (const e of body.expenses) {
          if (!isValidUuid(e.id)) continue;
          incomingExpenseIds.add(e.id);
          const expDateVal = toDateKey(e.date);
          await sql`
            INSERT INTO expenses (id, user_id, date, category, amount, description)
            VALUES (${e.id}, ${userId}, ${expDateVal}, ${e.category}, ${e.amount}, ${e.description || ''})
            ON CONFLICT (id) DO UPDATE SET
              date = EXCLUDED.date,
              category = EXCLUDED.category,
              amount = EXCLUDED.amount,
              description = EXCLUDED.description
            WHERE expenses.user_id = ${userId}
          `;
        }
      }
      for (const id of existingExpenseIds) {
        if (!incomingExpenseIds.has(id)) {
          await sql`DELETE FROM expenses WHERE id = ${id} AND user_id = ${userId}`;
        }
      }

      // --- WATER LOGS (Daily Aggregates) ---
      if (body.waterLogs && typeof body.waterLogs === 'object') {
        for (const [date, count] of Object.entries(body.waterLogs)) {
          if (count > 0) {
            await sql`DELETE FROM water_logs WHERE user_id = ${userId} AND date = ${date}`;
            await sql`INSERT INTO water_logs (user_id, date, count) VALUES (${userId}, ${date}, ${count})`;
          }
        }
      }

      // --- COFFEE LOGS (Daily Aggregates) ---
      if (body.coffeeLogs && typeof body.coffeeLogs === 'object') {
        for (const [date, count] of Object.entries(body.coffeeLogs)) {
          if (count > 0) {
             await sql`DELETE FROM coffee_logs WHERE user_id = ${userId} AND date = ${date}`;
             await sql`INSERT INTO coffee_logs (user_id, date, count) VALUES (${userId}, ${date}, ${count})`;
          }
        }
      }

      // --- WORKOUT LOGS ---
      const existingWorkouts = await sql`SELECT id FROM workout_logs WHERE user_id = ${userId}`;
      const existingWorkoutIds = new Set(existingWorkouts.map(w => w.id));
      const incomingWorkoutIds = new Set();

      if (Array.isArray(body.workoutLogs)) {
        for (const w of body.workoutLogs) {
          if (!isValidUuid(w.id)) continue;
          incomingWorkoutIds.add(w.id);
          await sql`
            INSERT INTO workout_logs (id, user_id, date, type, duration, notes)
            VALUES (${w.id}, ${userId}, ${w.date}, ${w.type}, ${w.duration || 30}, ${w.notes || ''})
            ON CONFLICT (id) DO UPDATE SET
              date = EXCLUDED.date,
              type = EXCLUDED.type,
              duration = EXCLUDED.duration,
              notes = EXCLUDED.notes
            WHERE workout_logs.user_id = ${userId}
          `;
        }
      }
      for (const id of existingWorkoutIds) {
        if (!incomingWorkoutIds.has(id)) {
          await sql`DELETE FROM workout_logs WHERE id = ${id} AND user_id = ${userId}`;
        }
      }

      // --- RECIPES ---
      const existingRecipes = await sql`SELECT id FROM recipes WHERE user_id = ${userId}`;
      const existingRecipeIds = new Set(existingRecipes.map(r => r.id));
      const incomingRecipeIds = new Set();

      if (Array.isArray(body.recipes)) {
        for (const r of body.recipes) {
           if (!isValidUuid(r.id)) continue;
           incomingRecipeIds.add(r.id);
           await sql`
            INSERT INTO recipes (id, user_id, title, ingredients, instructions, prep_time, cook_time, servings, category)
            VALUES (${r.id}, ${userId}, ${r.title}, ${JSON.stringify(r.ingredients || [])}::jsonb, ${JSON.stringify(r.instructions || [])}::jsonb, ${r.prepTime || null}, ${r.cookTime || null}, ${r.servings || null}, ${r.category || null})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              ingredients = EXCLUDED.ingredients,
              instructions = EXCLUDED.instructions,
              prep_time = EXCLUDED.prep_time,
              cook_time = EXCLUDED.cook_time,
              servings = EXCLUDED.servings,
              category = EXCLUDED.category
            WHERE recipes.user_id = ${userId}
           `;
        }
      }
      for (const id of existingRecipeIds) {
        if (!incomingRecipeIds.has(id)) {
          await sql`DELETE FROM recipes WHERE id = ${id} AND user_id = ${userId}`;
        }
      }

      // --- MEAL LOGS ---
      const existingMeals = await sql`SELECT id FROM meal_logs WHERE user_id = ${userId}`;
      const existingMealIds = new Set(existingMeals.map(m => m.id));
      const incomingMealIds = new Set();

      if (Array.isArray(body.mealLogs)) {
        for (const m of body.mealLogs) {
          if (!isValidUuid(m.id)) continue;
          incomingMealIds.add(m.id);
          const recipeIdVal = isValidUuid(m.recipeId) ? m.recipeId : null;
          await sql`
            INSERT INTO meal_logs (id, user_id, date, meal_type, description, recipe_id)
            VALUES (${m.id}, ${userId}, ${m.date}, ${m.mealType}, ${m.description}, ${recipeIdVal})
            ON CONFLICT (id) DO UPDATE SET
              date = EXCLUDED.date,
              meal_type = EXCLUDED.meal_type,
              description = EXCLUDED.description,
              recipe_id = EXCLUDED.recipe_id
            WHERE meal_logs.user_id = ${userId}
          `;
        }
      }
      for (const id of existingMealIds) {
        if (!incomingMealIds.has(id)) {
          await sql`DELETE FROM meal_logs WHERE id = ${id} AND user_id = ${userId}`;
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
