
-- Enable Cybrid game by setting it to active
UPDATE games 
SET is_active = true, updated_at = now()
WHERE title = 'Cybrid';

-- Add the new WGT Golf game
INSERT INTO games (
  title,
  description,
  image_url,
  trailer_url,
  min_duration_seconds,
  max_duration_seconds,
  is_active,
  executable_path,
  working_directory,
  arguments
) VALUES (
  'WGT Golf',
  'Experience professional golf simulation in VR with realistic physics and beautiful courses',
  'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1182020/318c59c266c59cfca8522aa5f4ef520f9cf3c5b1/capsule_616x353.jpg?t=1739563870',
  'https://www.youtube.com/embed/qQzi6GAL4I8?si=q27k-zogPQWRN5JE',
  600,
  3600,
  true,
  'C:\Program Files (x86)\Steam\steamapps\common\WGT Golf\WGTGolf.exe',
  'C:\Program Files (x86)\Steam\steamapps\common\WGT Golf',
  ''
);
