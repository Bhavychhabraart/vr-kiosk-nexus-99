
-- Add trailer_url column to games table if it doesn't exist
ALTER TABLE games ADD COLUMN IF NOT EXISTS trailer_url TEXT;

-- Update games with trailer URLs
UPDATE games SET trailer_url = 'https://www.youtube.com/embed/vL39Sg2AqWg?si=hxvTJZHacT65-asy' 
WHERE title ILIKE '%beat saber%';

UPDATE games SET trailer_url = 'https://www.youtube.com/embed/TbTF1u6vHho?si=1NRtZJ8S9zi1cFLU' 
WHERE title ILIKE '%propagation%';

UPDATE games SET trailer_url = 'https://www.youtube.com/embed/8neAmeFaLuQ?si=xdCNiDnPOOZTJISl' 
WHERE title ILIKE '%eleven assassin%' OR title ILIKE '%elven assassin%';

UPDATE games SET trailer_url = 'https://www.youtube.com/embed/zpqsCNavNN4?si=0hzIBULWCT22WRKc' 
WHERE title ILIKE '%undead%';

UPDATE games SET trailer_url = 'https://www.youtube.com/embed/hPY4TRRHwZc?si=RJ9rXwtVwvWWCrte' 
WHERE title ILIKE '%fruit ninja%';

UPDATE games SET trailer_url = 'https://www.youtube.com/embed/OpnTbOz_POE?si=BD_Kq-XTfRYf5NSg' 
WHERE title ILIKE '%roller coaster%';

UPDATE games SET trailer_url = 'https://www.youtube.com/embed/qnVQFSUIDjE?si=GGjfeQZGcFuv-Z7o' 
WHERE title ILIKE '%richie%' OR title ILIKE '%plank%';
