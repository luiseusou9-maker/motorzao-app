import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase"; 
import Vitrine from "./Vitrine";
import PDV from "./PDV"; 

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // Pega o caminho atual da URL (ex: /PDV ou /)
  const [caminho, setCaminho] = useState(window.location.pathname);

  useEffect(() => {
    // 1. Busca a sessão inicial do usuário
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuta mudanças no login (entrar/sair)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. Escuta o botão "voltar" do navegador para não quebrar o roteamento
    const handleLocationChange = () => setCaminho(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Tela de boot personalizada
  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl font-[1000] italic animate-pulse uppercase tracking-[0.3em]">
          CARREGANDO MOTOR<span className="text-orange-600">ZÃO</span>...
        </div>
      </div>
    );
  }

  // 🛠️ Roteamento Inteligente
  // Se o cara tentar entrar no /PDV sem ser você, o PDV já tem a trava lá dentro,
  // mas aqui a gente garante que ele receba a session.
  if (caminho === '/PDV') {
    return <PDV session={session} />;
  }

  // Por padrão, mostra a vitrine
  return <Vitrine session={session} />;
}

export default App;