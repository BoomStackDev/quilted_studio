-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator', 'student', 'admin')),
  email text not null,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- specialty_tags
create table public.specialty_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.specialty_tags enable row level security;
create policy "Anyone can read active tags" on public.specialty_tags for select using (active = true);
create policy "Admin full access to tags" on public.specialty_tags for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- creators
create table public.creators (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text,
  tagline text,
  bio text,
  photo_url text,
  youtube_url text,
  instagram_url text,
  website_url text,
  creator_type text not null default 'affiliated' check (creator_type in ('affiliated', 'hosted')),
  status text not null default 'pending_gate1' check (status in ('pending_gate1', 'approved_gate1', 'pending_gate2', 'approved', 'rejected', 'changes_requested')),
  stripe_account_id text,
  stripe_onboarded boolean default false,
  published boolean default false,
  admin_notes text,
  feedback_for_creator text,
  youtube_subscriber_count integer,
  badge text,
  created_at timestamptz default now(),
  updated_at timestamptz
);
alter table public.creators enable row level security;
create policy "Anyone can read published creators" on public.creators for select using (published = true);
create policy "Creators can read own row" on public.creators for select using (auth.uid() = id);
create policy "Creators can update own row" on public.creators for update using (auth.uid() = id);
create policy "Admin full access to creators" on public.creators for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- creator_applications
create table public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  youtube_url text,
  primary_platform text,
  referral_source text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'held', 'rejected')),
  admin_notes text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);
alter table public.creator_applications enable row level security;
create policy "Anyone can insert application" on public.creator_applications for insert with check (true);
create policy "Admin full access to applications" on public.creator_applications for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- creator_tags
create table public.creator_tags (
  creator_id uuid references public.creators(id) on delete cascade,
  tag_id uuid references public.specialty_tags(id) on delete cascade,
  primary key (creator_id, tag_id)
);
alter table public.creator_tags enable row level security;
create policy "Anyone can read creator tags" on public.creator_tags for select using (true);
create policy "Creators can manage own tags" on public.creator_tags for all using (auth.uid() = creator_id);

-- courses
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  title text not null,
  tagline text,
  description text,
  course_type text not null check (course_type in ('affiliated', 'hosted')),
  price numeric(10,2),
  level text check (level in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
  delivery_mode text check (delivery_mode in ('all_at_once', 'drip')),
  external_url text,
  stripe_product_id text,
  stripe_price_id text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz
);
alter table public.courses enable row level security;
create policy "Anyone can read published courses" on public.courses for select using (published = true);
create policy "Creators can manage own courses" on public.courses for all using (auth.uid() = creator_id);
create policy "Admin full access to courses" on public.courses for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- course_tags
create table public.course_tags (
  course_id uuid references public.courses(id) on delete cascade,
  tag_id uuid references public.specialty_tags(id) on delete cascade,
  primary key (course_id, tag_id)
);
alter table public.course_tags enable row level security;
create policy "Anyone can read course tags" on public.course_tags for select using (true);
create policy "Creators can manage own course tags" on public.course_tags for all using (
  exists (select 1 from public.courses where id = course_id and creator_id = auth.uid())
);

-- enrollments
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  stripe_payment_intent text,
  stripe_charge_id text,
  amount_paid numeric(10,2),
  platform_fee numeric(10,2),
  creator_payout numeric(10,2),
  enrolled_at timestamptz default now()
);
alter table public.enrollments enable row level security;
create policy "Students can read own enrollments" on public.enrollments for select using (auth.uid() = student_id);
create policy "Service role can insert enrollments" on public.enrollments for insert with check (true);
create policy "Admin full access to enrollments" on public.enrollments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null,
  cloudflare_video_id text,
  drip_days integer,
  pdf_storage_path text,
  created_at timestamptz default now()
);
alter table public.lessons enable row level security;
create policy "Enrolled students can read lessons" on public.lessons for select using (
  exists (select 1 from public.enrollments where course_id = lessons.course_id and student_id = auth.uid())
  or
  exists (select 1 from public.courses where id = lessons.course_id and creator_id = auth.uid())
);
create policy "Creators can manage own lessons" on public.lessons for all using (
  exists (select 1 from public.courses where id = course_id and creator_id = auth.uid())
);

-- creator_videos
create table public.creator_videos (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  youtube_url text not null,
  youtube_id text not null,
  title text,
  thumbnail_url text,
  tag_id uuid references public.specialty_tags(id),
  level text check (level in ('Beginner', 'Intermediate', 'Advanced')),
  position integer check (position between 1 and 3),
  created_at timestamptz default now()
);
alter table public.creator_videos enable row level security;
create policy "Anyone can read creator videos" on public.creator_videos for select using (true);
create policy "Creators can manage own videos" on public.creator_videos for all using (auth.uid() = creator_id);
create policy "Admin full access to videos" on public.creator_videos for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- affiliated_links
create table public.affiliated_links (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null unique,
  destination_url text not null,
  last_checked_at timestamptz,
  is_healthy boolean,
  created_at timestamptz default now()
);
alter table public.affiliated_links enable row level security;
create policy "Anyone can read affiliated links" on public.affiliated_links for select using (true);
create policy "Creators can manage own links" on public.affiliated_links for all using (
  exists (select 1 from public.courses where id = course_id and creator_id = auth.uid())
);
create policy "Admin full access to links" on public.affiliated_links for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- affiliated_clicks
create table public.affiliated_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.affiliated_links(id),
  student_id uuid references public.profiles(id),
  creator_id uuid not null references public.creators(id),
  course_id uuid not null references public.courses(id),
  clicked_at timestamptz default now(),
  ip_hash text,
  user_agent text
);
alter table public.affiliated_clicks enable row level security;
create policy "Authenticated users can insert clicks" on public.affiliated_clicks for insert with check (true);
create policy "Creators can read own clicks" on public.affiliated_clicks for select using (auth.uid() = creator_id);
create policy "Admin full access to clicks" on public.affiliated_clicks for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- student_affiliated_courses
create table public.student_affiliated_courses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  course_id uuid not null references public.courses(id),
  saved_at timestamptz default now()
);
alter table public.student_affiliated_courses enable row level security;
create policy "Students can read own saved courses" on public.student_affiliated_courses for select using (auth.uid() = student_id);
create policy "Students can insert own saved courses" on public.student_affiliated_courses for insert with check (auth.uid() = student_id);
create policy "Admin full access to saved courses" on public.student_affiliated_courses for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- lesson_completions
create table public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id),
  lesson_id uuid not null references public.lessons(id),
  completed_at timestamptz default now()
);
alter table public.lesson_completions enable row level security;
create policy "Students can read own completions" on public.lesson_completions for select using (auth.uid() = student_id);
create policy "Students can insert own completions" on public.lesson_completions for insert with check (auth.uid() = student_id);
create policy "Admin full access to completions" on public.lesson_completions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  author_name text not null,
  author_platform text,
  content text not null,
  display_order integer,
  active boolean default true,
  created_at timestamptz default now()
);
alter table public.testimonials enable row level security;
create policy "Anyone can read active testimonials" on public.testimonials for select using (active = true);
create policy "Creators can manage own testimonials" on public.testimonials for all using (auth.uid() = creator_id);
create policy "Admin full access to testimonials" on public.testimonials for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
