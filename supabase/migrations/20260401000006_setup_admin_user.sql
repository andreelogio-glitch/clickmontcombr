-- ============================================
-- ClickMont - Setup de Usuarios
-- Execute no Supabase SQL Editor
-- Data: 2026-04-01
--
-- 1. Acesse: https://supabase.com/dashboard/project/mmfsgzsvhktcyflarlae/sql
-- 2. Cole e execute este SQL
-- ============================================

-- ============================================
-- 1. VERIFICAR USUARIOS CADASTRADOS
-- ============================================
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- ============================================
-- 2. CONFIGURAR ADMIN (andreelogio@gmail.com)
-- ============================================
-- Primeiro, encontre o ID do usuario admin
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Busca o usuario admin
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'andreelogio@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Insere/atualiza o perfil como admin
        INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)
        VALUES (
            gen_random_uuid(),
            admin_user_id,
            'Andre Ramos',
            '11999999999',
            'admin',
            'Sao Paulo',
            true,
            true
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'admin',
            full_name = 'Andre Ramos',
            is_approved = true,
            is_verified = true;
        
        -- Insere na tabela user_roles para a funcao has_role()
        INSERT INTO user_roles (id, user_id, role)
        VALUES (gen_random_uuid(), admin_user_id, 'admin'::public.app_role)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Admin configurado com sucesso!';
    ELSE
        RAISE NOTICE 'Usuario admin nao encontrado. Faca login em clickmont.com.br primeiro.';
    END IF;
END $$;

-- ============================================
-- 3. VERIFICAR SE O ADMIN ESTA CONFIGURADO
-- ============================================
SELECT 
    u.email,
    p.role,
    p.is_approved,
    p.is_verified,
    CASE WHEN EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = u.id 
        AND ur.role = 'admin'::public.app_role
    ) THEN 'SIM' ELSE 'NAO' END as has_admin_role
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
WHERE u.email = 'andreelogio@gmail.com';

-- ============================================
-- 4. VERIFICAR TODOS OS USUARIOS
-- ============================================
SELECT 
    u.email,
    p.role,
    p.is_approved,
    p.is_verified
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
ORDER BY u.created_at DESC;
