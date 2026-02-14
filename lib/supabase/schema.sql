-- Create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS valentine;

-- Create profiles table
CREATE TABLE IF NOT EXISTS valentine.profiles (
    id TEXT PRIMARY KEY, -- 'him' or 'her'
    name TEXT NOT NULL,
    avatar_url TEXT,
    tagline TEXT,
    bio TEXT,
    personality_tags TEXT[],
    likes TEXT[],
    dislikes TEXT[],
    password TEXT DEFAULT '19042025', -- Default password for migration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for existing profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'valentine'
        AND table_name = 'profiles'
        AND column_name = 'password'
    ) THEN
        ALTER TABLE valentine.profiles ADD COLUMN password TEXT DEFAULT '19042025';
    END IF;
END $$;

-- Create love_logs table
CREATE TABLE IF NOT EXISTS valentine.love_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL, -- 'him' or 'her'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table (Found in store.ts usage)
CREATE TABLE IF NOT EXISTS valentine.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- 'him' or 'her'
    title TEXT,
    content TEXT,
    media_url TEXT,
    media_urls TEXT[],
    event_date DATE,
    type TEXT, -- 'photo', 'video', 'text', 'milestone'
    location TEXT,
    reactions JSONB DEFAULT '{}'::jsonb, -- { "him": "❤️", "her": "👍" }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
-- DROP TABLE to ensure we recreate it with the correct Foreign Key to valentine.posts
DROP TABLE IF EXISTS valentine.comments;

CREATE TABLE valentine.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES valentine.posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- 'him' or 'her'
    content TEXT NOT NULL,
    reactions JSONB DEFAULT '{}'::jsonb, -- { "him": "❤️", "her": "👍" }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create greetings table
CREATE TABLE IF NOT EXISTS valentine.greetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    time_of_day TEXT NOT NULL, -- 'morning', 'afternoon', 'evening', 'night'
    author_id TEXT NOT NULL, -- 'him' or 'her'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS valentine.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- The recipient ('him' or 'her')
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT, -- e.g., 'timeline', 'countdown', 'love', 'profile'
    link TEXT, -- Deep link tab or path
    is_read BOOLEAN DEFAULT false,
    notification_key TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE valentine.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE valentine.love_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE valentine.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE valentine.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE valentine.greetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE valentine.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for simplistic couple app usage)
-- Drop existing policies first to avoid error if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public access to profiles" ON valentine.profiles;
    DROP POLICY IF EXISTS "Allow public access to love_logs" ON valentine.love_logs;
    DROP POLICY IF EXISTS "Allow public access to posts" ON valentine.posts;
    DROP POLICY IF EXISTS "Allow public access to comments" ON valentine.comments;
    DROP POLICY IF EXISTS "Allow public access to greetings" ON valentine.greetings;
    DROP POLICY IF EXISTS "Allow public access to notifications" ON valentine.notifications;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Allow public access to profiles" ON valentine.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to love_logs" ON valentine.love_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to posts" ON valentine.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to comments" ON valentine.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to greetings" ON valentine.greetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to notifications" ON valentine.notifications FOR ALL USING (true) WITH CHECK (true);

-- Insert initial data if not exists
INSERT INTO valentine.profiles (id, name, avatar_url, bio, personality_tags, likes, dislikes)
VALUES 
    ('him', 'Pink Duck 🏹', 'https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/A%CC%89nh%20ma%CC%80n%20hi%CC%80n.PNG', 'Là 1 BA và 1 lập trình diên tham dọng. Nghiện cafe và thích ăn cay', ARRAY['Tham dọng', 'Vloger', 'Cafe', 'Ớt'], ARRAY['Code', 'Làm app', 'Chạy bộ', 'Cafe', 'Thích ăn cay'], ARRAY['Ồn ào', 'Phim kinh dị']),
    ('her', 'Mĩn Bì 💘', 'https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/IMG_A67177C3D2B4-1.jpeg', '1 BA mới nhú, dễ nhạy cảm, hong thích đi làm nhưng muốn có nhiều tiền, thích dọn dẹp, hong thích ra đường - lâu lâu cũng có thích.', ARRAY['BA', 'Dễ nhạy cảm', 'Thích dọn dẹp', 'Thích ra đường'], ARRAY['Cacao sữa gấu', 'Latte dâu', 'Mochi', 'Lẩu bò', 'Dồi trường', 'Thú linh nướng', 'Bún đậu', 'Bún riêu', 'Texas'], ARRAY['Thằn lằn', 'Rắn', 'Bò sát các loại', 'Đi làm'])
ON CONFLICT (id) DO NOTHING;

-- Grant usage on schema to anon and authenticated roles (CRITICAL FOR NEW SCHEMA)
GRANT USAGE ON SCHEMA valentine TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA valentine TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA valentine TO anon, authenticated, service_role;

-- Additional specific grants for comments just in case
GRANT SELECT, INSERT, UPDATE, DELETE ON valentine.comments TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON valentine.greetings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON valentine.notifications TO anon, authenticated, service_role;

-- Create messages table
CREATE TABLE IF NOT EXISTS valentine.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL, -- 'him' or 'her'
    content TEXT,
    media_url TEXT,
    media_urls TEXT[], -- Array of URLs for multiple attachments
    media_type TEXT, -- 'image', 'video', 'file'
    is_edited BOOLEAN DEFAULT false,
    reply_to_id UUID, -- Parent message ID (optional, for direct replies in future)
    reply_to_type TEXT, -- 'post', 'event', 'caption' (optional, for context)
    reply_to_ref_id TEXT, -- ID of the post/event/caption being discussed
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE valentine.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public access to messages" ON valentine.messages FOR ALL USING (true) WITH CHECK (true);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON valentine.messages TO anon, authenticated, service_role;
