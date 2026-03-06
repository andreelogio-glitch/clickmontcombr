-- Garantir estrutura mínima do ClickMont para profiles e orders
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'cliente',
  created_at timestamptz NOT NULL DEFAULT now(),
  lgpd_accepted_at timestamptz,
  selfie_url text,
  document_url text,
  experience_proof_url text,
  is_verified boolean NOT NULL DEFAULT false,
  pix_key text,
  city text,
  is_approved boolean NOT NULL DEFAULT false,
  cnpj text
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_urgent boolean NOT NULL DEFAULT false,
  code_validated boolean DEFAULT false,
  started_at timestamptz,
  montador_arrived boolean DEFAULT false,
  needs_wall_mount boolean NOT NULL DEFAULT false,
  title text NOT NULL,
  description text NOT NULL,
  furniture_type text NOT NULL,
  address text NOT NULL,
  photo_url text,
  status text NOT NULL DEFAULT 'pendente',
  service_type text NOT NULL DEFAULT 'montagem',
  city text,
  brand text,
  verification_code text
);

-- Índices e vínculo lógico por user_id (sem depender de auth.users)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);

-- RLS ativo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas mínimas idempotentes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users insert own profile'
  ) THEN
    CREATE POLICY "Users insert own profile"
      ON public.profiles
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users select own profile'
  ) THEN
    CREATE POLICY "Users select own profile"
      ON public.profiles
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users update own profile'
  ) THEN
    CREATE POLICY "Users update own profile"
      ON public.profiles
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Clients create own orders'
  ) THEN
    CREATE POLICY "Clients create own orders"
      ON public.orders
      FOR INSERT TO authenticated
      WITH CHECK (client_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Clients see own orders'
  ) THEN
    CREATE POLICY "Clients see own orders"
      ON public.orders
      FOR SELECT TO authenticated
      USING (client_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Clients update own orders'
  ) THEN
    CREATE POLICY "Clients update own orders"
      ON public.orders
      FOR UPDATE TO authenticated
      USING (client_id = auth.uid())
      WITH CHECK (client_id = auth.uid());
  END IF;
END $$;

-- Trigger para preencher client_id automaticamente
CREATE OR REPLACE FUNCTION public.set_order_client_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.client_id IS NULL THEN
    NEW.client_id := auth.uid();
  END IF;

  IF NEW.client_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'client_id deve ser o usuário autenticado';
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_set_order_client_id'
      AND tgrelid = 'public.orders'::regclass
  ) THEN
    CREATE TRIGGER trg_set_order_client_id
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_client_id();
  END IF;
END $$;