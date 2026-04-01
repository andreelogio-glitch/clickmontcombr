-- ============================================
-- USERS DE TESTE - Sprint 0 Testing
-- Execute no Supabase SQL Editor
-- Data: 2026-04-01
-- ============================================

-- ============================================
-- ATENCAO: Substitua os UUIDs pelos IDs reais dos usuarios
-- Para encontrar o ID do seu usuario:
-- SELECT id, email FROM auth.users;
-- ============================================

-- ============================================
-- 1. VERIFICAR USUARIOS CADASTRADOS
-- ============================================
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- 2. VERIFICAR PERFIS EXISTENTES
-- ============================================
SELECT id, user_id, full_name, role, email FROM profiles LIMIT 10;

-- ============================================
-- 3. CRIAR PERFIL DE ADMIN
-- ============================================
-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo ID real do seu usuario

-- Exemplo (descomente e ajuste):
-- INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)
-- VALUES (
--   gen_random_uuid(),  -- ID do profile
--   'SEU_USER_ID_AQUI',  -- ID do usuario auth.users
--   'Andre Ramos',       -- Nome completo
--   '11999999999',       -- Telefone
--   'admin',             -- Papel: admin, cliente, montador
--   'Sao Paulo',         -- Cidade
--   true,                -- Aprovado
--   true                 -- Verificado
-- )
-- ON CONFLICT (user_id) DO UPDATE SET
--   role = 'admin',
--   full_name = 'Andre Ramos',
--   is_approved = true;

-- ============================================
-- 4. CRIAR PERFIL DE MONTADOR
-- ============================================
-- SUBSTITUA 'MONTADOR_USER_ID_AQUI' pelo ID real

-- Exemplo:
-- INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)
-- VALUES (
--   gen_random_uuid(),
--   'MONTADOR_USER_ID_AQUI',
--   'Joao Silva',
--   '11988888888',
--   'montador',
--   'Sao Paulo',
--   true,
--   true
-- );

-- ============================================
-- 5. CRIAR PERFIL DE CLIENTE
-- ============================================
-- SUBSTITUA 'CLIENTE_USER_ID_AQUI' pelo ID real

-- Exemplo:
-- INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)
-- VALUES (
--   gen_random_uuid(),
--   'CLIENTE_USER_ID_AQUI',
--   'Maria Santos',
--   '11977777777',
--   'cliente',
--   'Sao Paulo',
--   true,
--   true
-- );

-- ============================================
-- 6. CRIAR USER_ROLES (para has_role)
-- ============================================
-- Adicione a role de admin para o seu usuario

-- SUBSTITUA 'SEU_USER_ID_AQUI':
-- INSERT INTO user_roles (id, user_id, role)
-- VALUES (gen_random_uuid(), 'SEU_USER_ID_AQUI', 'admin')
-- ON CONFLICT DO NOTHING;

-- ============================================
-- 7. VERIFICAR PAPEL DO USUARIO
-- ============================================
-- Teste a funcao has_role:
-- SELECT has_role('SEU_USER_ID_AQUI', 'admin'::public.app_role);

-- ============================================
-- 8. CRIAR PEDIDO DE TESTE
-- ============================================
-- Para testar o fluxo completo, crie um pedido de teste

-- SUBSTITUA os IDs:
-- INSERT INTO orders (
--   id, client_id, title, description, furniture_type, 
--   address, city, status, service_type, is_urgent,
--   needs_wall_mount, valor_da_nota, verification_code
-- )
-- VALUES (
--   gen_random_uuid(),
--   'CLIENTE_USER_ID_AQUI',
--   'Montagem de Guarda-roupa',
--   'Preciso montar um guarda-roupa de 6 portas',
--   'Guarda-roupa',
--   'Rua Teste, 123 - Centro',
--   'Sao Paulo',
--   'aguardando',
--   'montagem',
--   false,
--   false,
--   2500.00,
--   substr(md5(random()::text), 1, 4)
-- );

-- ============================================
-- 9. VERIFICAR SE TUDO ESTA OK
-- ============================================
SELECT 
  'auth.users' as tabela,
  count(*) as total
FROM auth.users
UNION ALL
SELECT 
  'profiles',
  count(*)
FROM profiles
UNION ALL
SELECT 
  'orders',
  count(*)
FROM orders
UNION ALL
SELECT 
  'user_roles',
  count(*)
FROM user_roles
UNION ALL
SELECT 
  'bids',
  count(*)
FROM bids;

-- ============================================
-- 10. VERIFICAR SE O USUARIO E ADMIN
-- ============================================
-- Substitua 'SEU_EMAIL' pelo email cadastrado:
-- SELECT 
--   u.email,
--   p.role,
--   has_role(u.id, 'admin'::public.app_role) as is_admin
-- FROM auth.users u
-- JOIN profiles p ON p.user_id = u.id
-- WHERE u.email = 'SEU_EMAIL';
