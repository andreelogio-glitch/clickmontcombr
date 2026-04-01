-- ============================================
-- ClickMont - Criar Usuarios de Teste
-- Execute no Supabase SQL Editor
-- Data: 2026-04-01
--
-- ANTES DE EXECUTAR:
-- 1. Crie 3 contas em https://clickmont.com.br:
--    - admin@clickmont.com.br (sera seu admin)
--    - montador@clickmont.com.br (sera montador)
--    - cliente@clickmont.com.br (sera cliente)
-- 2. Acesse: https://supabase.com/dashboard/project/zwfiadmmfgillrqhlbjw/sql
-- 3. Execute este SQL
-- ============================================

-- ============================================
-- 1. VERIFICAR USUARIOS CADASTRADOS
-- ============================================
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- 2. CRIAR PERFIS (SUBSTITUA OS UUIDs ABAIXO)
-- ============================================
-- Apos executar o SQL acima, substitua os UUIDs nos INSERTs abaixo

-- EXEMPLO (ajuste os IDs conforme resultado acima):
/*
INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)
VALUES 
    (gen_random_uuid(), 'ADMIN_UUID_AQUI', 'Andre Admin', '11999999999', 'admin', 'Sao Paulo', true, true),
    (gen_random_uuid(), 'MONTADOR_UUID_AQUI', 'Joao Montador', '11988888888', 'montador', 'Sao Paulo', true, true),
    (gen_random_uuid(), 'CLIENTE_UUID_AQUI', 'Maria Cliente', '11977777777', 'cliente', 'Sao Paulo', true, true)
ON CONFLICT (user_id) DO UPDATE SET
    is_approved = true,
    is_verified = true;
*/

-- ============================================
-- 3. CRIAR USER_ROLES
-- ============================================
/*
INSERT INTO user_roles (id, user_id, role)
SELECT 
    gen_random_uuid(),
    id,
    'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@clickmont.com.br'
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- 4. VERIFICAR TUDO
-- ============================================
SELECT 
    'auth.users' as tabela, count(*) as total FROM auth.users
UNION ALL
SELECT 'profiles', count(*) FROM profiles
UNION ALL
SELECT 'orders', count(*) FROM orders
UNION ALL
SELECT 'user_roles', count(*) FROM user_roles
UNION ALL
SELECT 'bids', count(*) FROM bids;

-- ============================================
-- 5. VERIFICAR ADMIN
-- ============================================
/*
SELECT 
    u.email,
    p.role,
    has_role(u.id, 'admin'::public.app_role) as is_admin
FROM auth.users u
JOIN profiles p ON p.user_id = u.id
WHERE u.email LIKE '%@clickmont.com.br';
*/
