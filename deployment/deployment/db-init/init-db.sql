-- Criando o usuário admin padrão caso não exista
INSERT INTO users (uid, username, role, ativo, criado_em, password_hash, must_change_password, failed_attempts)
VALUES (
    'admin-default-001', 
    'admin', 
    'admin', 
    true, 
    EXTRACT(EPOCH FROM NOW()), 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lbYx.h3jS.7z.Z9U2', 
    false, 
    0
) ON CONFLICT (username) DO NOTHING;