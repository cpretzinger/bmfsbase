/*
  # Premium Subscription System

  1. New Tables
    - `subscriptions`: Tracks user subscription status and history
    - `premium_features`: Defines available premium features
    - `user_feature_access`: Maps users to their accessible features

  2. New Functions
    - check_premium_access: Verifies if a user has access to a specific feature
    - get_user_subscription: Retrieves user's subscription details

  3. Security
    - RLS policies to protect subscription data
    - Functions are SECURITY DEFINER for consistent access
*/

-- Premium subscription types
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Premium features table
CREATE TABLE IF NOT EXISTS premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  required_tier subscription_tier NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User feature access table
CREATE TABLE IF NOT EXISTS user_feature_access (
  user_id UUID REFERENCES auth.users(id),
  feature_id UUID REFERENCES premium_features(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, feature_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public features access"
  ON premium_features FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their feature access"
  ON user_feature_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default premium features
INSERT INTO premium_features (code, name, description, required_tier) VALUES
  ('advanced_analytics', 'Advanced Analytics', 'Deep dive into your show statistics and listening patterns', 'basic'),
  ('prediction_contests', 'Prediction Contests', 'Enter multiple predictions per show and access historical prediction data', 'basic'),
  ('ad_free', 'Ad-Free Experience', 'Browse without advertisements', 'basic'),
  ('early_access', 'Early Access', 'Get early access to new features and beta testing', 'premium'),
  ('custom_stats', 'Custom Statistics', 'Create and save custom statistical queries and comparisons', 'premium'),
  ('api_access', 'API Access', 'Access to the BMFSBase API for custom integrations', 'premium')
ON CONFLICT (code) DO NOTHING;

-- Function to check premium access
CREATE OR REPLACE FUNCTION check_premium_access(
  user_id UUID,
  feature_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier subscription_tier;
  required_tier subscription_tier;
BEGIN
  -- Get user's current subscription tier
  SELECT tier INTO user_tier
  FROM subscriptions
  WHERE subscriptions.user_id = check_premium_access.user_id
  AND status = 'active'
  AND (end_date IS NULL OR end_date > now());

  -- Get required tier for feature
  SELECT required_tier INTO required_tier
  FROM premium_features
  WHERE code = feature_code;

  -- Compare tiers
  RETURN CASE
    WHEN user_tier IS NULL THEN false
    WHEN user_tier = 'premium' THEN true
    WHEN user_tier = 'basic' AND required_tier = 'basic' THEN true
    ELSE false
  END;
END;
$$;

-- Function to get user's subscription details
CREATE OR REPLACE FUNCTION get_user_subscription(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  WITH user_features AS (
    SELECT 
      pf.code,
      pf.name,
      pf.description
    FROM subscriptions s
    JOIN premium_features pf ON 
      CASE 
        WHEN s.tier = 'premium' THEN true
        WHEN s.tier = 'basic' AND pf.required_tier = 'basic' THEN true
        ELSE false
      END
    WHERE s.user_id = get_user_subscription.user_id
    AND s.status = 'active'
    AND (s.end_date IS NULL OR s.end_date > now())
  )
  SELECT json_build_object(
    'subscription', (
      SELECT json_build_object(
        'tier', tier,
        'status', status,
        'start_date', start_date,
        'end_date', end_date,
        'auto_renew', auto_renew
      )
      FROM subscriptions
      WHERE user_id = get_user_subscription.user_id
      AND status = 'active'
      AND (end_date IS NULL OR end_date > now())
    ),
    'features', (
      SELECT json_agg(json_build_object(
        'code', code,
        'name', name,
        'description', description
      ))
      FROM user_features
    )
  ) INTO result;

  RETURN COALESCE(result, json_build_object(
    'subscription', json_build_object(
      'tier', 'free'::subscription_tier,
      'status', 'active'::subscription_status,
      'start_date', now(),
      'end_date', null,
      'auto_renew', false
    ),
    'features', '[]'::json
  ));
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_premium_access TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();