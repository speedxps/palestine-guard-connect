-- Make assigned_to nullable in tasks table so tasks can be created unassigned
ALTER TABLE public.tasks ALTER COLUMN assigned_to DROP NOT NULL;