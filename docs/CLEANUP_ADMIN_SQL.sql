-- ============================================
-- LIMPEZA DO BANCO - CLICKMONT
-- Execute no Supabase SQL Editor
-- https://supabase.com/dashboard/project/mmfsgzsvhktcyflarlae/sql
-- ============================================

-- 1. ENCONTRA O ID DO ADMIN
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'andreelogio@gmail.com';
    
    RAISE NOTICE 'Admin ID: %', admin_user_id;
END $$;

-- 2. APAGA TODOS OS DADOS (MANTENDO ESTRUTURA)
TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE reviews CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE chat_messages CASCADE;

-- 3. RECRIA O ADMIN
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'andreelogio@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Insere perfil admin
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
        );
        
        -- Insere role admin
        INSERT INTO user_roles (id, user_id, role)
        VALUES (gen_random_uuid(), admin_user_id, 'admin'::public.app_role);
        
        RAISE NOTICE 'ADMIN RECRIADO COM SUCESSO!';
    ELSE
        RAISE NOTICE 'ERRO: Usuario admin nao encontrado. Faca login primeiro em clickmont.com.br';
    END IF;
END $$;

-- 4. VERIFICA O RESULTADO
SELECT 
    u.email,
    p.role as profile_role,
    CASE WHEN EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = u.id 
        AND ur.role = 'admin'::public.app_role
    ) THEN 'SIM' ELSE 'NAO' END as has_admin_role
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
WHERE u.email = 'andreelogio@gmail.com';
