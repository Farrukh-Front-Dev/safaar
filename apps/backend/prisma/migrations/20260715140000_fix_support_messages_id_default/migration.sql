-- Fix: support_messages and support_tickets id columns need gen_random_uuid() default
-- Without this, INSERT statements that omit the id column fail with NOT NULL constraint violation

ALTER TABLE support_messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE support_tickets ALTER COLUMN id SET DEFAULT gen_random_uuid();
