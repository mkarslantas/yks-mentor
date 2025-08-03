-- Yağmur'u (student) Mustafa'ya (coach) ata
UPDATE student_profiles 
SET coach_id = (SELECT id FROM users WHERE email = 'mustafa@arslantash.com' AND role = 'coach')
WHERE user_id = (SELECT id FROM users WHERE email = 'yagmur@arslantash.com' AND role = 'student');