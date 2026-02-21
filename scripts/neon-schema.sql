-- Life Dashboard - Neon PostgreSQL Schema
-- Auth olmadan: device_id ile tek kullanıcı (cihaz bazlı)
-- Sonra Supabase/Firebase Auth eklenince user_id güncellenir

-- Kullanıcı (cihaz/session bazlı - auth eklenince değişecek)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  device_id text unique,
  user_name text default 'Şampiyon',
  theme text default 'light',
  xp integer default 0,
  level integer default 1,
  left_layout jsonb default '["welcome","timer","activity","drinks","sport"]',
  right_layout jsonb default '["aiCoach","habits","tasks","goals","stats","calendar"]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Alışkanlıklar
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  frequency text not null check (frequency in ('daily','weekly','monthly')),
  streak integer default 0,
  target_period integer,
  completed_dates jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_habits_user on habits(user_id);

-- Görevler
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  text text not null,
  completed boolean default false,
  tag text default 'Genel',
  priority text default 'low' check (priority in ('low','medium','high')),
  repeat text default 'none' check (repeat in ('none','daily','weekly')),
  subtasks jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_tasks_user on tasks(user_id);

-- Görev tamamlama logları (count = o gün tamamlanan görev sayısı)
create table if not exists task_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  count integer default 1,
  unique(user_id, date)
);
create index if not exists idx_task_logs_user_date on task_logs(user_id, date);

-- Hedefler
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  current numeric default 0,
  target numeric not null,
  unit text default '',
  created_at timestamptz default now()
);
create index if not exists idx_goals_user on goals(user_id);

-- Öğrenciler
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  parent_name text,
  parent_phone text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_students_user on students(user_id);

-- Ders şablonları
create table if not exists lesson_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  student_name text not null,
  subject text not null,
  day text not null,
  time text not null,
  duration integer default 60,
  fee integer,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_lesson_templates_user on lesson_templates(user_id);

-- Dersler
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  student_name text not null,
  subject text not null,
  time text not null,
  duration integer default 60,
  fee integer,
  notes text,
  cancelled boolean default false,
  payment_done boolean default false,
  parent_informed boolean default false,
  student_attended boolean default false,
  post_lesson_notes text,
  created_at timestamptz default now()
);
create index if not exists idx_lessons_user on lessons(user_id);

-- Giderler
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  category text not null,
  amount integer not null,
  description text,
  created_at timestamptz default now()
);
create index if not exists idx_expenses_user on expenses(user_id);

-- Su logları
create table if not exists water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  count integer not null default 0,
  unique(user_id, date)
);

-- Kahve logları
create table if not exists coffee_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  count integer not null default 0,
  unique(user_id, date)
);

-- Antrenman logları
create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  type text not null,
  duration integer not null,
  notes text,
  created_at timestamptz default now()
);
create index if not exists idx_workout_logs_user on workout_logs(user_id);

-- Tarifler
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  ingredients jsonb default '[]',
  instructions jsonb default '[]',
  prep_time integer,
  cook_time integer,
  servings text,
  category text,
  created_at timestamptz default now()
);
create index if not exists idx_recipes_user on recipes(user_id);

-- Yemek logları
create table if not exists meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('Kahvaltı','Öğle','Akşam','Ara öğün')),
  description text not null,
  recipe_id uuid references recipes(id) on delete set null,
  created_at timestamptz default now()
);
create index if not exists idx_meal_logs_user on meal_logs(user_id);
