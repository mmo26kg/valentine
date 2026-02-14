-- Create countdowns table
create table if not exists countdowns (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    date text not null,
    icon text default 'heart',
    type text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table countdowns enable row level security;

-- Policies (matching events table)
create policy "Public read access"
    on countdowns for select
    using (true);

create policy "Authenticated insert access"
    on countdowns for insert
    with check (true);

create policy "Authenticated update access"
    on countdowns for update
    using (true);

create policy "Authenticated delete access"
    on countdowns for delete
    using (true);

-- Seed defaults
insert into countdowns (title, date, icon, type, description)
values
    ('Valentine''s Day', '2026-02-14', 'heart', 'holiday', 'Our special day of love'),
    ('Anniversary', '2025-04-19', 'diamond', 'anniversary', 'The day it all began'),
    ('Sinh nhật Ẻm', '2026-05-10', 'cake', 'birthday', 'Make it unforgettable'),
    ('Sinh nhật Ảnh', '2026-06-26', 'gift', 'birthday', 'A day to celebrate him');
