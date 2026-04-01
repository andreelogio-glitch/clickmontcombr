-- ============================================
-- ClickMont - Setup Admin (Adaptado)
-- Executar no Supabase SQL Editor
-- Data: 2026-04-01
-- ============================================

-- 1. Ver estrutura da tabela perfis
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perfis'
ORDER BY ordinal_position;

-- 2. Verificar usuarios no auth
SELECT id, email 
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Configurar Admin
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'andreelogio@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario admin encontrado: %', admin_user_id;
        
        -- Insere ou atualiza perfil
        INSERT INTO perfis (id, user_id, nome, telefone, tipo, cidade, ativo, verificado)
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
            tipo = 'admin',
            nome = 'Andre Ramos',
            ativo = true,
            verificado = true;
        
        RAISE NOTICE 'Admin configurado com sucesso!';
    ELSE
        RAISE NOTICE 'ATENCAO: Usuario andreelogio@gmail.com nao encontrado!';
        RAISE NOTICE 'Faca login no site primeiro: https://clickmont.com.br';
    END IF;
END $$;

-- 4. Verificar resultado
SELECT 
    u.email,
    p.tipo,
    p.ativo,
    p.verificado
FROM auth.users u
LEFT JOIN perfis p ON p.user_id = u.id
WHERE u.email = 'andreelogio@gmail.com';
