// ============================================
// Script: Criar usuário root/admin no Supabase
// Executa o signUp via API Auth do Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mmfsgzsvhktcyflarlae.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZmlhZG1tZmdpbGxycWhsYmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTE3OTcsImV4cCI6MjA4NzYyNzc5N30.xqCG6hExgRWq5uuA8TxIkDlAunQj7NOMr2zEIhVt394';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdminUser() {
  console.log('🔐 Criando usuário root/admin...\n');

  // 1. Registrar o usuário via Auth
  const { data, error } = await supabase.auth.signUp({
    email: 'andreelogio@gmail.com',
    password: 'Atena2019#',
    options: {
      data: {
        full_name: 'Andre Ramos',
        role: 'admin'
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      console.log('ℹ️  Usuário já existe no Auth. Pulando criação...');
      console.log('   Vamos promover diretamente a admin via SQL.\n');
    } else {
      console.error('❌ Erro ao criar usuário:', error.message);
      return;
    }
  } else {
    console.log('✅ Usuário criado no Supabase Auth!');
    console.log('   ID:', data.user?.id);
    console.log('   Email:', data.user?.email);
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  PASSO SEGUINTE (OBRIGATORIO):');
  console.log('   Execute o SQL abaixo no Supabase SQL Editor');
  console.log('   URL: https://supabase.com/dashboard/project/mmfsgzsvhktcyflarlae/sql/new');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`-- Cole e execute este SQL no Supabase SQL Editor:`);
  console.log(`DO $$`);
  console.log(`DECLARE`);
  console.log(`    admin_uid UUID;`);
  console.log(`BEGIN`);
  console.log(`    SELECT id INTO admin_uid FROM auth.users WHERE email = 'andreelogio@gmail.com';`);
  console.log(`    IF admin_uid IS NULL THEN`);
  console.log(`        RAISE EXCEPTION 'Usuário não encontrado no Auth!';`);
  console.log(`    END IF;`);
  console.log(``);
  console.log(`    -- Atualizar profile para admin`);
  console.log(`    INSERT INTO profiles (id, user_id, full_name, phone, role, city, is_approved, is_verified)`);
  console.log(`    VALUES (gen_random_uuid(), admin_uid, 'Andre Ramos', '11999999999', 'admin', 'São Paulo', true, true)`);
  console.log(`    ON CONFLICT (user_id) DO UPDATE SET`);
  console.log(`        role = 'admin', is_approved = true, is_verified = true, full_name = 'Andre Ramos';`);
  console.log(``);
  console.log(`    -- Inserir no user_roles`);
  console.log(`    INSERT INTO user_roles (id, user_id, role)`);
  console.log(`    VALUES (gen_random_uuid(), admin_uid, 'admin'::public.app_role)`);
  console.log(`    ON CONFLICT DO NOTHING;`);
  console.log(``);
  console.log(`    RAISE NOTICE 'Admin root configurado com sucesso!';`);
  console.log(`END $$;`);
  console.log('');
}

createAdminUser();
