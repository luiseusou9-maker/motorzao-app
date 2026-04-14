import React from 'react';
import { supabase } from './lib/supabase';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    // Definimos a URL de redirecionamento. 
    // Se estiver no ar, usa o link da Vercel. Se estiver no PC, usa o localhost.
    const redirectUrl = import.meta.env.PROD 
      ? 'https://motorzao-app.vercel.app' 
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    if (error) console.error('Erro no login:', error.message);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="bg-[#080808] max-w-sm w-full p-10 text-center relative border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(255,69,0,0.15)]">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-600 hover:text-orange-600 transition-colors font-black">✕</button>

        <div className="mb-10">
          <h2 className="text-4xl font-[1000] italic tracking-tighter text-white uppercase leading-none">
            MOTOR<span className="text-orange-600">ZÃO</span>
          </h2>
          <div className="h-[2px] w-10 bg-orange-600 mx-auto mt-4"></div>
          <p className="text-[9px] text-gray-500 tracking-[0.5em] uppercase mt-4 font-black italic">Acesso Exclusivo</p>
        </div>
        
        <div className="space-y-6 mb-10">
          <p className="text-gray-400 text-sm italic leading-relaxed">
            Identifique-se para ver ofertas de <br/> 
            <span className="text-white font-black uppercase not-italic">Promissória e Financiamento</span>
          </p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white text-black font-[1000] py-6 px-8 rounded-2xl transition-all hover:bg-orange-600 hover:text-white active:scale-95 shadow-2xl group"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" className="group-hover:brightness-0 group-hover:invert transition-all" />
          <span className="text-xs uppercase italic">Entrar com Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginModal;