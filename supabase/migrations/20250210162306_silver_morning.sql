-- Create game tables if they don't exist
DO $$ 
BEGIN
  -- Create bingo_events table if it doesn't exist
  CREATE TABLE IF NOT EXISTS bingo_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Create set_roulette_configs table if it doesn't exist
  CREATE TABLE IF NOT EXISTS set_roulette_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points_multiplier NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Create roulette_predictions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS roulette_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    config_id UUID REFERENCES set_roulette_configs(id),
    song_id UUID REFERENCES songs(id),
    correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Create user_achievements table if it doesn't exist
  CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES game_achievements(id),
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, achievement_id)
  );
END $$;

-- Enable RLS on tables
ALTER TABLE bingo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_roulette_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create bingo_events"
  ON bingo_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their predictions"
  ON roulette_predictions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create predictions"
  ON roulette_predictions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their earned achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bingo_events_user ON bingo_events(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON roulette_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON bingo_events, roulette_predictions, user_achievements TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;