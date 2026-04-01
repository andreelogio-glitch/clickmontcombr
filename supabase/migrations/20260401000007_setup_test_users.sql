-- ============================================
-- ClickMont - Criar Usuarios de Teste
-- Execute no Supabase SQL Editor
-- Data: 2026-04-01
--
-- IMPORTANTE: Execute 20260401000006_setup_admin_user.sql PRIMEIRO
--
-- Este SQL cria perfis para montador e cliente DEPOIS que eles
-- se cadastrarem pelo site clickmont.com.br
-- ============================================

-- ============================================
-- PASSO 1: Cadastre-se no site primeiro!
-- ============================================
-- 1. Acesse https://clickmont.com.br/cadastro
-- 2. Crie a conta: montador@teste.com (tipo: montador)
-- 3. Crie a conta: cliente@teste.com (tipo: cliente)
-- 4. Execute este SQL abaixo

-- ============================================
-- PASSO 2: Execute este SQL
-- ============================================

DO $$
DECLARE
    montador_id UUID;
    cliente_id UUID;
BEGIN
    -- Busca ID do montador
    SELECT id INTO montador_id
    FROM auth.users
    WHERE email = 'montador@teste.com';
    
    -- Busca ID do cliente
    SELECT id INTO cliente_id
    FROM auth.users
    WHERE email = 'cliente@teste.com';
    
    -- Cria perfil do montador
    IF montador_id IS NOT NULL THEN
        INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)
        VALUES (
            gen_random_uuid(),
            montador_id,
            'Joao Montador',
            '11988888888',
            'montador',
            'Sao Paulo',
            true,
            true
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'montador',
            is_approved = true,
            is_verified = true;
        
        -- Adiciona role de montador
        INSERT INTO user_roles (id, user_id, role)
        VALUES (gen_random_uuid(), montador_id, 'montador'::public.app_role)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Montador configurado!';
    ELSE
        RAISE NOTICE 'Montador nao encontrado. Cadastre-se em clickmont.com.br primeiro.';
    END IF;
    
    -- Cria perfil do cliente
    IF cliente_id IS NOT NULL THEN
        INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)
        VALUES (
            gen_random_uuid(),
            cliente_id,
            'Maria Cliente',
            '11977777777',
            'cliente',
            'Sao Paulo',
            true,
            true
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'cliente',
            is_approved = true,
            is_verified = true;
        
        RAISE NOTICE 'Cliente configurado!';
    ELSE
        RAISE NOTICE 'Cliente nao encontrado. Cadastre-se em clickmont.com.br primeiro.';
    END IF;
END $$;

-- ============================================
-- VERIFICAR RESULTADO
-- ============================================
SELECT 
    u.email,
    p.role,
    p.is_approved,
    p.is_verified
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id
ORDER BY u.created_at DESC;
