-- Create default users
DELETE FROM users WHERE email IN ('yagmur@arslantash.com', 'mustafa@arslantash.com');

INSERT INTO users (email, password, role, name, phone, created_at, updated_at) VALUES 
-- Öğrenci: yagmur@arslantash.com / password: yks2024
('yagmur@arslantash.com', '$2a$12$UmImei.pcRZSNE80t1mrt.OAjdDJTKJuiLutEe2kXIVdHOXkVTAzi', 'student', 'Yağmur Arslan', NULL, datetime('now'), datetime('now')),
-- Mentor: mustafa@arslantash.com / password: mentor2024  
('mustafa@arslantash.com', '$2a$12$rbx8.PyRZb5M3ctCTA8mK.zdh15XuAdZRjZK.36CZOnQMIOZ5bdnO', 'coach', 'Mustafa Arslan', NULL, datetime('now'), datetime('now'));