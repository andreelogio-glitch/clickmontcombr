-- ============================================
-- ClickMont - Verificar Estrutura do Banco
-- Execute primeiro para entender a estrutura atual
-- ============================================

-- 1. Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar se existe tabela de perfis
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' OR table_name = 'user_profiles' OR table_name = 'usuarios'
ORDER BY ordinal_position;

-- 3. Ver usuarios no auth
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;
