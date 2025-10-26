-- Replace the password hash with your own (e.g., bcrypt) before running in production
INSERT INTO users (email, password_hash, full_name, role)
VALUES ('admin@example.com', '$2a$10$replace_me_with_real_bcrypt_hash', 'Admin', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
