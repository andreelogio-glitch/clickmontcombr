-- ============================================
-- EXCLUIR SCHEMA RH (outro projeto)
-- ClickMont - Limpeza do Banco
-- ============================================

-- IMPORTANTE: Confirme que quer excluir antes de executar!

-- 1. Ver o que existe no schema RH
SELECT table_name FROM information_schema.tables WHERE table_schema = 'RH';

-- 2. Excluir todas as tabelas do schema RH
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'RH' LOOP
        EXECUTE 'DROP TABLE IF EXISTS RH.' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE 'Excluida tabela: RH.%', r.tablename;
    END LOOP;
    
    -- 3. Excluir o schema
    DROP SCHEMA IF EXISTS RH CASCADE;
    RAISE NOTICE 'Schema RH excluido com sucesso!';
END $$;

-- 4. Verificar se restou algo
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'RH';
