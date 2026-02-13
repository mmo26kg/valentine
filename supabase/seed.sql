-- Seed data for schema 'valentine'

-- 1. Settings
INSERT INTO valentine.settings (key, value)
VALUES
  ('password', '19042025'),
  ('start_date', '2025-04-19')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Captions (Sample data for testing)
-- Note: Captions are unique by (date, role)
INSERT INTO valentine.captions (date, role, content)
VALUES
  ('2025-02-14', 'him', 'Happy Valentine''s Day my love!'),
  ('2025-02-14', 'her', 'Love you more than words can say!'),
  ('2026-02-13', 'him', 'Hôm nay trời đẹp quá, nhớ em!')
ON CONFLICT (date, role) DO UPDATE SET content = EXCLUDED.content;

-- 3. Posts
INSERT INTO valentine.posts (user_id, title, content, media_url, event_date, type, location, created_at)
VALUES
  (
    'him',
    'Valentine''s Dinner',
    'The night we decided to move in together. The jazz band was playing our song, and the cocktails were perfect.',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
    '2025-02-14',
    'photo',
    'San Francisco, CA',
    '2025-02-14 18:00:00+00'
  ),
  (
    'her',
    'Paris Trip',
    'Paris was everything we dreamed of. Waking up to the smell of fresh croissants and exploring the winding streets of Montmartre.',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    '2025-01-05',
    'photo',
    'Paris, France',
    '2025-01-05 09:00:00+00'
  ),
  (
    'her',
    'The Surprise Gift',
    'I still can''t believe you found the first edition of my favorite book. It was the most thoughtful gift anyone has ever given me. I cried happy tears all morning.',
    NULL,
    '2024-12-25',
    'text',
    'Home',
    '2024-12-25 10:00:00+00'
  ),
  (
    'him',
    'Hiking Adventure',
    'Reached the summit just in time for sunset. Worth every step.',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    '2024-11-12',
    'photo',
    'Yosemite National Park',
    '2024-11-12 16:30:00+00'
  );
