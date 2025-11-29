-- Push subscriptions table for storing user notification subscriptions
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(500) UNIQUE NOT NULL,
  p256dh_key VARCHAR(255) NOT NULL,
  auth_key VARCHAR(255) NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
