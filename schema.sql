-- Tabela de Usuários (Extensão do Auth.Users)
-- 1. ESTRUTURA DAS TABELAS
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT,
  email TEXT UNIQUE,
  foto TEXT,
  telefone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.lojas_internas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_loja TEXT NOT NULL,
  endereco_completo TEXT NOT NULL,
  contato_dono TEXT,
  comissao_acordada DECIMAL(5,2),
  cidade TEXT DEFAULT 'Campinas',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES public.lojas_internas(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  preco DECIMAL(12,2) NOT NULL,
  quilometragem INTEGER,
  fotos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'vendido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. LÓGICA DE PERSISTÊNCIA AUTOMÁTICA (AUTH SYNC)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, foto, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN NEW.email = 'seu-email-admin@gmail.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. SEGURANÇA (ROW LEVEL SECURITY)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lojas_internas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de veículos" ON public.veiculos;
CREATE POLICY "Leitura pública de veículos" ON public.veiculos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de lojas" ON public.lojas_internas;
CREATE POLICY "Leitura pública de lojas" ON public.lojas_internas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Apenas admin gerencia veículos" ON public.veiculos;
CREATE POLICY "Apenas admin gerencia veículos" ON public.veiculos 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'admin'));

-- 4. DADOS INICIAIS (SEED)
INSERT INTO public.lojas_internas (nome_loja, endereco_completo, contato_dono, comissao_acordada, cidade)
VALUES 
('Motorzão Matriz', 'Av. José de Souza Campos, 123 - Cambuí', '19999991111', 5.0, 'Campinas'),
('Performance Campinas', 'Rua Coronel Quirino, 456 - Cambuí', '19999992222', 7.5, 'Campinas'),
('Elite Cars Barão', 'Av. Albino J. B. de Oliveira, 789 - Barão Geraldo', '19999993333', 6.0, 'Campinas')
ON CONFLICT DO NOTHING;

INSERT INTO public.veiculos (loja_id, marca, modelo, ano, preco, quilometragem, fotos, status)
VALUES 
((SELECT id FROM public.lojas_internas WHERE nome_loja = 'Motorzão Matriz' LIMIT 1), 'Chevrolet', 'Onix Premier', 2022, 65000.00, 15000, '{"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800"}', 'disponivel'),
((SELECT id FROM public.lojas_internas WHERE nome_loja = 'Motorzão Matriz' LIMIT 1), 'Hyundai', 'HB20 Platinum', 2021, 58000.00, 22000, '{"https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800"}', 'disponivel'),
((SELECT id FROM public.lojas_internas WHERE nome_loja = 'Performance Campinas' LIMIT 1), 'Honda', 'Civic Touring', 2020, 145000.00, 45000, '{"https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800"}', 'disponivel'),
((SELECT id FROM public.lojas_internas WHERE nome_loja = 'Performance Campinas' LIMIT 1), 'Toyota', 'Corolla XEi', 2023, 155000.00, 5000, '{"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=800"}', 'disponivel'),
((SELECT id FROM public.lojas_internas WHERE nome_loja = 'Elite Cars Barão' LIMIT 1), 'Volkswagen', 'Golf GTI', 2018, 160000.00, 60000, '{"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"}', 'disponivel')
ON CONFLICT DO NOTHING;