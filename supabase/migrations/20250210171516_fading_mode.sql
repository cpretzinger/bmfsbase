-- First drop existing tables if they exist
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS game_achievements CASCADE;
DROP TABLE IF EXISTS roulette_predictions CASCADE;
DROP TABLE IF EXISTS song_pools CASCADE;
DROP TABLE IF EXISTS set_roulette_configs CASCADE;
DROP TABLE IF EXISTS bingo_squares CASCADE;
DROP TABLE IF EXISTS bingo_cards CASCADE;
DROP TABLE IF EXISTS bingo_events CASCADE;
DROP TABLE IF EXISTS game_scores CASCADE;

-- Create base tables first
CREATE TABLE game_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES game_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, achievement_id)
);

-- Create bingo tables
CREATE TABLE bingo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES concerts(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bingo_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES bingo_events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  winner BOOLEAN DEFAULT false
);

CREATE TABLE bingo_squares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES bingo_cards(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 25),
  marked BOOLEAN DEFAULT false,
  marked_at TIMESTAMPTZ,
  UNIQUE(card_id, position)
);

-- Create roulette tables
CREATE TABLE set_roulette_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points_multiplier NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE song_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES set_roulette_configs(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  weight INTEGER DEFAULT 1,
  UNIQUE(config_id, song_id)
);

CREATE TABLE roulette_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  config_id UUID REFERENCES set_roulette_configs(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE game_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bingo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bingo_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bingo_squares ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_roulette_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE roulette_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies using consistent column names
CREATE POLICY "Public read access for achievements"
  ON game_achievements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their scores"
  ON game_scores FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Users can create scores"
  ON game_scores FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can view their achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Users can manage their bingo events"
  ON bingo_events FOR ALL
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can manage their bingo cards"
  ON bingo_cards FOR ALL
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can manage their bingo squares"
  ON bingo_squares FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bingo_cards bc
    WHERE bc.id = card_id
    AND bc.player_id = auth.uid()
  ));

CREATE POLICY "Users can manage their roulette configs"
  ON set_roulette_configs FOR ALL
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Public read access for song pools"
  ON song_pools FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their predictions"
  ON roulette_predictions FOR ALL
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- Create indexes
CREATE INDEX idx_game_scores_player ON game_scores(player_id);
CREATE INDEX idx_user_achievements_player ON user_achievements(player_id);
CREATE INDEX idx_bingo_events_creator ON bingo_events(creator_id);
CREATE INDEX idx_bingo_events_concert ON bingo_events(concert_id);
CREATE INDEX idx_bingo_cards_player ON bingo_cards(player_id);
CREATE INDEX idx_bingo_cards_event ON bingo_cards(event_id);
CREATE INDEX idx_bingo_squares_card ON bingo_squares(card_id);
CREATE INDEX idx_song_pools_config ON song_pools(config_id);
CREATE INDEX idx_predictions_player ON roulette_predictions(player_id);

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON game_scores, user_achievements, bingo_events, 
                       bingo_cards, bingo_squares, set_roulette_configs,
                       song_pools, roulette_predictions TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;