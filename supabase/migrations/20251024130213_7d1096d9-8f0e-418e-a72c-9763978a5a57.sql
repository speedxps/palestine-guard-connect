-- Update agency_communications table to use department names instead of agency_id
ALTER TABLE public.agency_communications
ADD COLUMN IF NOT EXISTS target_department text NOT NULL DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS sender_department text;

-- Make agency_id nullable for backward compatibility
ALTER TABLE public.agency_communications
ALTER COLUMN agency_id DROP NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_agency_communications_target_dept 
ON public.agency_communications(target_department);

CREATE INDEX IF NOT EXISTS idx_agency_communications_sender 
ON public.agency_communications(sender_id);