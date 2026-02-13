-- ─── Valentine Couple App — Initial Schema ───

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('him', 'her')),
  bio TEXT DEFAULT '',
  personality_tags TEXT[] DEFAULT '{}',
  likes TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily captions
CREATE TABLE IF NOT EXISTS daily_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Timeline posts
CREATE TABLE IF NOT EXISTS timeline_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'text', 'milestone')) DEFAULT 'text',
  location TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Couple settings
CREATE TABLE IF NOT EXISTS couple_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  him_id UUID REFERENCES users(id) ON DELETE SET NULL,
  her_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Countdown events
CREATE TABLE IF NOT EXISTS countdown_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  icon TEXT DEFAULT 'heart',
  type TEXT NOT NULL CHECK (type IN ('birthday', 'anniversary', 'holiday', 'custom')) DEFAULT 'custom',
  description TEXT DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_captions_date ON daily_captions(date);
CREATE INDEX IF NOT EXISTS idx_daily_captions_user_date ON daily_captions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_date ON timeline_posts(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_posts_type ON timeline_posts(type);
CREATE INDEX IF NOT EXISTS idx_countdown_events_date ON countdown_events(date);
