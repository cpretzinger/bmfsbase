/*
  # Clean Database Migration

  1. Changes
    - Safely remove all existing data from tables
    - Preserve table structures and relationships
    - Reset for full data import

  2. Notes
    - Uses safe DELETE operations
    - Maintains referential integrity
    - Preserves table structures and constraints
*/

-- Delete data from tables in correct order to respect foreign key constraints
DELETE FROM user_feature_access;
DELETE FROM premium_features;
DELETE FROM subscriptions;
DELETE FROM user_favorite_venues;
DELETE FROM user_favorite_songs;
DELETE FROM user_badges;
DELETE FROM user_preferences;
DELETE FROM comment_votes;
DELETE FROM post_votes;
DELETE FROM comments;
DELETE FROM posts;
DELETE FROM game_scores;
DELETE FROM setlists;
DELETE FROM songs;
DELETE FROM verified_attendance;
DELETE FROM concerts;