-- إضافة foreign key constraint لربط investigation_notes بجدول profiles
ALTER TABLE investigation_notes 
ADD CONSTRAINT investigation_notes_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- إضافة foreign key constraint لربط investigation_closure_requests بجدول profiles
ALTER TABLE investigation_closure_requests 
ADD CONSTRAINT investigation_closure_requests_requested_by_fkey 
FOREIGN KEY (requested_by) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE investigation_closure_requests 
ADD CONSTRAINT investigation_closure_requests_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) 
REFERENCES profiles(id) 
ON DELETE SET NULL;