-- ============================================
-- ClickMont - Fix: Adicionar 'admin' ao role check e configurar admin
-- Data: 2026-04-03
-- ============================================

-- 1. Remover constraint antiga que não permite 'admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Adicionar nova constraint incluindo 'admin'
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('cliente', 'montador', 'admin'));

-- 3. Atualizar perfil do admin
UPDATE public.profiles
SET
  role = 'admin',
  is_approved = true,
  is_verified = true,
  full_name = 'André Ramos dos Santos'
WHERE user_id = 'e0dfa500-9d5e-408e-aa82-4de9168332dd';

-- 4. Garantir entrada em user_roles
INSERT INTO public.user_roles (id, user_id, role)
VALUES (gen_random_uuid(), 'e0dfa500-9d5e-408e-aa82-4de9168332dd', 'admin'::public.app_role)
ON CONFLICT DO NOTHING;

-- 5. Atualizar user_metadata no auth (permite que o JWT também reflita admin)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE id = 'e0dfa500-9d5e-408e-aa82-4de9168332dd';

-- 6. Verificação
SELECT
  u.email,
  p.role as profile_role,
  p.is_approved,
  p.is_verified,
  ur.role as user_roles_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.id = 'e0dfa500-9d5e-408e-aa82-4de9168332dd';
