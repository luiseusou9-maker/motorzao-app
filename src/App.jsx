import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase"; 
import Vitrine from "./Vitrine";
import PDV from "./PDV"; 
import Politica from "./Politica"; // NOVO: Importando a página que criamos

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [caminho, setCaminho] = useState(window.location.pathname);

  useEffect(() => {
    // 1. Busca a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuta mudanças no login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN') {
        setCaminho(window.location.pathname);
      }
    });

    const handleLocationChange = () => setCaminho(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl font-[1000] italic animate-pulse uppercase tracking-[0.3em]">
          CARREGANDO MOTOR<span className="text-orange-600">ZÃO</span>...
        </div>
      </div>
    );
  }

  // 🛠️ ROTEAMENTO DAS PÁGINAS

  // Rota para Políticas e Quem Somos
  if (caminho === '/politica') {
    return <Politica />;
  }

  // Rota para o Painel de Administração
  if (caminho === '/PDV') {
    return <PDV session={session} />;
  }

  // Por padrão, mostra a vitrine (Home)
  return <Vitrine session={session} />;
}

export default App;