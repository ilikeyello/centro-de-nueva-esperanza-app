-- Add language preference to push subscriptions so notifications can be localized per user

ALTER TABLE push_subscriptions
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'es';

UPDATE push_subscriptions
SET language = 'es'
WHERE language IS NULL;
