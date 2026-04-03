-- RLS Policies for Clickmont Platform
-- Validado por Diego Dados e Samuel Segurança

-- 1. Tabela profiles (Perfis de usuário)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Tabela montadores (Perfis públicos de montadores)
ALTER TABLE public.montadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa logada pode ver montadores aprovados"
  ON public.montadores FOR SELECT
  USING (status = 'aprovado' OR auth.uid() = user_id);

CREATE POLICY "Montadores podem editar seus próprios dados"
  ON public.montadores FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Tabela agendamentos
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes veem seus agendamentos, e Montadores também"
  ON public.agendamentos FOR SELECT
  USING (auth.uid() = cliente_id OR auth.uid() = montador_id);
