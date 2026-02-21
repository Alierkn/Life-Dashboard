# Life Dashboard — Veritabanı Planı

## Mevcut Durum

Tüm veriler **localStorage**'da tutuluyor:
- ✅ Cihazda kalıcı
- ❌ Telefon ↔ bilgisayar senkron yok
- ❌ Tarayıcı temizlenince veri kaybı
- ❌ Çoklu cihaz kullanımı yok

---

## Hedef

- **Çoklu cihaz senkronu** (telefon + bilgisayar)
- **Kullanıcı bazlı veri** (giriş yapınca kendi verilerin)
- **Yedekleme** (sunucu tarafında güvenli)
- **Offline-first** (internet yokken de çalışsın, sonra senkron)

---

## Veritabanı Seçenekleri

| Seçenek | Artı | Eksi | Ücretsiz Limit |
|---------|------|------|----------------|
| **Supabase** | PostgreSQL, Auth, Realtime, RLS | - | 500MB DB, 2 proje |
| **Firebase** | Kolay, Realtime | NoSQL, vendor lock | 1GB storage |
| **Vercel Postgres** | Vercel entegrasyonu | Yeni, daha az olgun | 256MB |
| **PlanetScale** | MySQL, serverless | Daha karmaşık | 5GB |

### Öneri: **Supabase** (veya alternatifler)

**Supabase:**
- PostgreSQL (ilişkisel, güçlü)
- Ücretsiz Auth (email, Google, GitHub)
- Row Level Security (RLS) ile güvenlik
- Realtime ile anlık senkron
- ⚠️ **7 gün hareketsizlikte proje duraklar**

**Alternatifler (duraklama konusunda daha rahat):**
- **Firebase** — Hareketsizlikte duraklama yok, NoSQL
- **Neon** — PostgreSQL, scale-to-zero ama ilk istekte otomatik uyanır
- **PocketBase** — Self-hosted, tam kontrol

Detaylı karşılaştırma: [DATABASE_ALTERNATIVES.md](./DATABASE_ALTERNATIVES.md)

---

## Veri Modeli (Supabase / PostgreSQL)

### 1. Kullanıcı & Auth

Supabase Auth kullanılacak (ayrı tablo gerekmez). `auth.users` tablosundaki `id` ile ilişkilendirilecek.

```sql
-- user_profiles: Auth ile ek bilgiler
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_name text default 'Şampiyon',
  theme text default 'light',
  xp integer default 0,
  level integer default 1,
  left_layout jsonb default '["welcome","timer","activity","drinks","sport"]',
  right_layout jsonb default '["aiCoach","habits","tasks","goals","stats","calendar"]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 2. Alışkanlıklar

```sql
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  frequency text not null check (frequency in ('daily','weekly','monthly')),
  streak integer default 0,
  target_period integer,
  completed_dates jsonb default '[]',  -- ["2026-02-21","2026-02-20"]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_habits_user on habits(user_id);
```

### 3. Görevler

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  completed boolean default false,
  tag text default 'Genel',
  priority text default 'low' check (priority in ('low','medium','high')),
  repeat text default 'none' check (repeat in ('none','daily','weekly')),
  subtasks jsonb default '[]',  -- [{id, text, completed}]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table task_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  unique(user_id, date)
);

create index idx_tasks_user on tasks(user_id);
create index idx_task_logs_user_date on task_logs(user_id, date);
```

### 4. Hedefler

```sql
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  current numeric default 0,
  target numeric not null,
  unit text default '',
  created_at timestamptz default now()
);

create index idx_goals_user on goals(user_id);
```

### 5. Özel Dersler

```sql
create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  parent_name text,
  parent_phone text,
  notes text,
  created_at timestamptz default now()
);

create table lesson_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  subject text not null,
  day text not null,
  time text not null,
  duration integer default 60,
  fee integer,
  notes text,
  created_at timestamptz default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  category text not null,
  amount integer not null,
  description text,
  created_at timestamptz default now()
);

create index idx_lessons_user on lessons(user_id);
create index idx_expenses_user on expenses(user_id);
```

### 6. Su & Kahve

```sql
create table water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  count integer not null default 0,
  unique(user_id, date)
);

create table coffee_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  count integer not null default 0,
  unique(user_id, date)
);
```

### 7. Spor

```sql
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null,
  duration integer not null,
  notes text,
  created_at timestamptz default now()
);

create index idx_workout_logs_user on workout_logs(user_id);
```

### 8. Yemek & Tarifler

```sql
create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  ingredients jsonb default '[]',
  instructions jsonb default '[]',
  prep_time integer,
  cook_time integer,
  servings text,
  category text,
  created_at timestamptz default now()
);

create table meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('Kahvaltı','Öğle','Akşam','Ara öğün')),
  description text not null,
  recipe_id uuid references recipes(id) on delete set null,
  created_at timestamptz default now()
);

create index idx_recipes_user on recipes(user_id);
create index idx_meal_logs_user on meal_logs(user_id);
```

---

## Row Level Security (RLS)

Her tabloda kullanıcı sadece kendi verilerini görebilmeli:

```sql
alter table habits enable row level security;
create policy "Users can CRUD own habits" on habits
  for all using (auth.uid() = user_id);

-- Aynı policy tüm tablolara uygulanacak
```

---

## Uygulama Adımları

### Faz 1: Supabase Kurulumu
1. [supabase.com](https://supabase.com) → Yeni proje
2. SQL Editor ile yukarıdaki tabloları oluştur
3. RLS policy'leri ekle
4. `.env` dosyasına `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` ekle

### Faz 2: Auth Entegrasyonu
1. `@supabase/supabase-js` kur
2. Login sayfası (email + şifre, opsiyonel Google)
3. Kullanıcı giriş yapınca `user_id` al

### Faz 3: Veri Senkronu
1. Her entity için Supabase client (select, insert, update, delete)
2. localStorage'dan mevcut veriyi migrate et (ilk girişte)
3. Realtime subscribe (opsiyonel, anlık senkron)

### Faz 4: Offline-First (Opsiyonel)
1. IndexedDB veya PouchDB ile offline cache
2. Bağlantı gelince sync

---

## localStorage → Supabase Migrasyonu

İlk girişte:
1. localStorage'da veri var mı kontrol et
2. Varsa "Verilerinizi buluta taşıyayım mı?" diye sor
3. Kullanıcı onaylarsa tüm verileri Supabase'e insert et
4. localStorage'ı temizle (veya yedek olarak tut)

---

## Tahmini Süre

| Faz | Süre |
|-----|------|
| Supabase kurulum + schema | 1–2 saat |
| Auth entegrasyonu | 2–3 saat |
| Veri senkronu (CRUD) | 4–6 saat |
| Migrasyon + test | 2 saat |
| **Toplam** | **~10–15 saat** |

---

## Alternatif: localStorage + Periyodik Yedek

Veritabanına geçmeden önce:
- **Supabase Storage** ile JSON yedekleme (Profil → Yedekle → otomatik Storage'a yükle)
- Daha basit, ancak çoklu cihaz senkronu yok
