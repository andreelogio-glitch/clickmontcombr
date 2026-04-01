-- ============================================
-- ClickMont - Criar Usuários de Teste
-- Execute no Supabase SQL Editor
-- Data: 2026-04-01
-- ============================================

-- ANTES DE EXECUTAR:
-- 1. Cadastre-se no site https://clickmont.com.br com:
--    - montador@teste.com (tipo: montador)
--    - cliente@teste.com (tipo: cliente)
-- 2. Execute este SQL depois

DO $$
DECLARE
    montador_id UUID;
    cliente_id UUID;
BEGIN
    -- 1. Busca ID do montador
    SELECT id INTO montador_id
    FROM auth.users
    WHERE email = 'montador@teste.com';
    
    -- 2. Busca ID do cliente
    SELECT id INTO cliente_id
    FROM auth.users
    WHERE email = 'cliente@teste.com';
    
    -- 3. Configura Montador
    IF montador_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, user_id, full_name, phone, role)
        VALUES (gen_random_uuid(), montador_id, 'João Montador', '11988888888', 'montador')
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'montador',
            full_name = 'João Montador';
        
        INSERT INTO public.user_roles (id, user_id, role)
        VALUES (gen_random_uuid(), montador_id, 'montador')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Montador configurado!';
    ELSE
        RAISE NOTICE 'Montador nao encontrado. Cadastre-se em clickmont.com.br primeiro.';
    END IF;
    
    -- 4. Configura Cliente
    IF cliente_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, user_id, full_name, phone, role)
        VALUES (gen_random_uuid(), cliente_id, 'Maria Cliente', '11977777777', 'cliente')
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'cliente',
            full_name = 'Maria Cliente';
        
        RAISE NOTICE 'Cliente configurado!';
    ELSE
        RAISE NOTICE 'Cliente nao encontrado. Cadastre-se em clickmont.com.br primeiro.';
    END IF;
END $$;

-- Verificar resultado
SELECT 
    u.email,
    p.role,
    p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE u.email IN ('montador@teste.com', 'cliente@teste.com', 'andreelogio@gmail.com');
