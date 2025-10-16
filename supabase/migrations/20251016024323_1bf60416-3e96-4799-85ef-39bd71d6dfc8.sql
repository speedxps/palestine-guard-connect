-- Add foreign key constraint if not exists for judicial_messages sender_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'judicial_messages_sender_id_fkey'
  ) THEN
    ALTER TABLE judicial_messages
    ADD CONSTRAINT judicial_messages_sender_id_fkey
    FOREIGN KEY (sender_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;