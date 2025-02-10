-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS game_achievements CASCADE;
DROP TABLE IF EXISTS roulette_predictions CASCADE;
DROP TABLE IF EXISTS song_pools CASCADE;
DROP TABLE IF EXISTS set_roulette_configs CASCADE;
DROP TABLE IF EXISTS bingo_squares CASCADE;
DROP TABLE IF EXISTS bingo_cards CASCADE;
DROP TABLE IF EXISTS bingo_events CASCADE;
DROP TABLE IF EXISTS game_scores CASCADE;

-- Create game_scores table
CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bingo_events table
CREATE TABLE bingo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bingo_cards table
CREATE TABLE bingo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES bingo_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  winner BOOLEAN DEFAULT false
);

-- Create bingo_squares table
CREATE TABLE bingo_squares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES bingo_cards(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 25),
  marked BOOLEAN DEFAULT false,
  marked_at TIMESTAMPTZ,
  UNIQUE(card_id, position)
);

-- Create set_roulette_configs table
CREATE TABLE set_roulette_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points_multiplier NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create song_pools table
CREATE TABLE song_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES set_roulette_configs(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id),
  weight INTEGER DEFAULT 1,
  UNIQUE(config_id, song_id)
);

-- Create roulette_predictions table
CREATE TABLE roulette_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id UUID REFERENCES set_roulette_configs(id),
  song_id UUID REFERENCES songs(id),
  correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create game_achievements table
CREATE TABLE game_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES game_achievements(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE bingo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bingo_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bingo_squares ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_roulette_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public read access for bingo_events"
  ON bingo_events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create bingo_events"
  ON bingo_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their bingo cards"
  ON bingo_cards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bingo cards"
  ON bingo_cards FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their bingo squares"
  ON bingo_squares FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bingo_cards bc
    WHERE bc.id = card_id
    AND bc.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their bingo squares"
  ON bingo_squares FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bingo_cards bc
    WHERE bc.id = card_id
    AND bc.user_id = auth.uid()
  ));

CREATE POLICY "Public read access for roulette configs"
  ON set_roulette_configs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create roulette configs"
  ON set_roulette_configs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public read access for song pools"
  ON song_pools FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their predictions"
  ON roulette_predictions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create predictions"
  ON roulette_predictions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public read access for achievements"
  ON game_achievements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their earned achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_game_scores_user ON game_scores(user_id);
CREATE INDEX idx_bingo_events_concert ON bingo_events(concert_id);
CREATE INDEX idx_bingo_events_user ON bingo_events(user_id);
CREATE INDEX idx_bingo_cards_event ON bingo_cards(event_id);
CREATE INDEX idx_bingo_cards_user ON bingo_cards(user_id);
CREATE INDEX idx_bingo_squares_card ON bingo_squares(card_id);
CREATE INDEX idx_bingo_squares_song ON bingo_squares(song_id);
CREATE INDEX idx_song_pools_config ON song_pools(config_id);
CREATE INDEX idx_song_pools_song ON song_pools(song_id);
CREATE INDEX idx_predictions_user ON roulette_predictions(user_id);
CREATE INDEX idx_predictions_config ON roulette_predictions(config_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON game_scores, bingo_events, bingo_cards, bingo_squares, 
                       roulette_predictions, user_achievements TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;