-- SAMPLE DATA FOR RTI PORTAL
-- Run this in your Supabase SQL Editor to populate the portal with realistic data.

-- 1. Ensure receipt_no column exists (if not already added)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS receipt_no TEXT UNIQUE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 2. Clear existing sample data (Optional)
-- DELETE FROM applications WHERE applicant LIKE 'Sample %';

-- 3. Insert Sample Applications
INSERT INTO applications (applicant, email, status, receipt_no, remarks, created_at)
VALUES 
('Sample Rajesh Kumar', 'rajesh.k@example.com', 'Approved', 'RTI-2026-0001', 'Information provided via registered post on 10/05/2026.', NOW() - INTERVAL '30 days'),
('Sample Priya Sharma', 'priya.s@example.com', 'Pending', 'RTI-2026-0002', NULL, NOW() - INTERVAL '25 days'),
('Sample Amit Singh', 'amit.singh@gov.in', 'Approved', 'RTI-2026-0003', 'Documents uploaded to portal.', NOW() - INTERVAL '20 days'),
('Sample Sneha Patil', 'sneha.p@tech.com', 'Rejected', 'RTI-2026-0004', 'Application incomplete. Missing Section 6(1) details.', NOW() - INTERVAL '15 days'),
('Sample Vikram Reddy', 'v.reddy@hyd.in', 'Pending', 'RTI-2026-0005', 'Under review by Public Information Officer.', NOW() - INTERVAL '10 days'),
('Sample Ananya Iyer', 'ananya.i@uni.edu', 'Approved', 'RTI-2026-0006', 'Transferred to relevant department.', NOW() - INTERVAL '5 days'),
('Sample Rahul Verma', 'rahul.v@media.com', 'Pending', 'RTI-2026-0007', NULL, NOW() - INTERVAL '2 days'),
('Sample Megha Das', 'megha.das@ngo.org', 'Pending', 'RTI-2026-0008', NULL, NOW() - INTERVAL '1 day');

-- 4. Verify the data
SELECT * FROM applications LIMIT 10;
