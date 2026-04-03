-- ============================================
-- ClickMont - Criar/Promover Admin Root
-- EXECUTE NO SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/mmfsgzsvhktcyflarlae/sql/new
-- ============================================

DO $$
DECLARE
    admin_uid UUID;
BEGIN
    -- Busca o usuário pelo email
    SELECT id INTO admin_uid
    FROM auth.users
    WHERE email = 'andreelogio@gmail.com';

    IF admin_uid IS NULL THEN
        RAISE EXCEPTION 'Usuário andreelogio@gmail.com não encontrado no Auth! Faça login primeiro em clickmont.com.br';
    END IF;

    -- Garante o perfil como admin aprovado
    INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)
    VALUES (
        gen_random_uuid(),
        admin_uid,
        'Andre Ramos',
        '11999999999',
        'admin',
        'São Paulo',
        true,
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        full_name = 'Andre Ramos',
        is_approved = true,
        is_verified = true;

    -- Garante a role na tabela user_roles
    INSERT INTO user_roles (id, user_id, role)
    VALUES (gen_random_uuid(), admin_uid, 'admin'::public.app_role)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ Admin root (andreelogio@gmail.com) configurado com sucesso!';
END $$;

-- Verificar resultado:
SELECT
    u.email,
    p.full_name,
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
