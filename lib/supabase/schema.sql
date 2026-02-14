-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- 'him' or 'her'
    name TEXT NOT NULL,
    avatar_url TEXT,
    tagline TEXT,
    bio TEXT,
    personality_tags TEXT[],
    likes TEXT[],
    dislikes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create love_logs table
CREATE TABLE IF NOT EXISTS public.love_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL, -- 'him' or 'her'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Optional but recommended, though simplified for this pair app)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for simplistic couple app usage)
CREATE POLICY "Allow public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to love_logs" ON public.love_logs FOR ALL USING (true) WITH CHECK (true);

-- Insert initial data if not exists
INSERT INTO public.profiles (id, name, avatar_url, bio, personality_tags, likes, dislikes)
VALUES 
    ('him', 'Pink Duck 🏹', 'https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/A%CC%89nh%20ma%CC%80n%20hi%CC%80nh.PNG', 'Là 1 BA và 1 lập trình diên tham dọng. Nghiện cafe và thích ăn cay', ARRAY['Tham dọng', 'Vloger', 'Cafe', 'Ớt'], ARRAY['Code', 'Làm app', 'Chạy bộ', 'Cafe', 'Thích ăn cay'], ARRAY['Ồn ào', 'Phim kinh dị']),
    ('her', 'Mĩn Bì 💘', 'https://pub-79d67780b43f4e7c91fc78db86657824.r2.dev/media/IMG_A67177C3D2B4-1.jpeg', '1 BA mới nhú, dễ nhạy cảm, hong thích đi làm nhưng muốn có nhiều tiền, thích dọn dẹp, hong thích ra đường - lâu lâu cũng có thích.', ARRAY['BA', 'Dễ nhạy cảm', 'Thích dọn dẹp', 'Thích ra đường'], ARRAY['Cacao sữa gấu', 'Latte dâu', 'Mochi', 'Lẩu bò', 'Dồi trường', 'Thú linh nướng', 'Bún đậu', 'Bún riêu', 'Texas'], ARRAY['Thằn lằn', 'Rắn', 'Bò sát các loại', 'Đi làm'])
ON CONFLICT (id) DO NOTHING;
