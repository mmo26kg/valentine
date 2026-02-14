-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TEXT NOT NULL, -- Format: MM-DD
    message TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default events
INSERT INTO events (title, date, message, icon) VALUES
    ('Happy Valentine''s Day', '02-14', 'Chúc ẻm của ngày Valentine đầy ý nghĩa và hạnh phúc. \n Anh thức tới 2h sáng để làm web này đấy. Buồn ngủ ghê ớ 🥱. \n Iu bé nhiềuuuuu... 🌹', '💕'),
    ('Happy Women''s Day', '03-08', 'You are the most beautiful soul I know.\nToday and every day, I celebrate you.', '🌹'),
    ('Merry Christmas, My Love', '12-25', 'The greatest gift I ever received is you.\nMerry Christmas, my darling.', '🎄'),
    ('Happy New Year Together', '01-01', 'Another year of love, laughter, and memories.\nHere''s to our forever.', '🎆');
