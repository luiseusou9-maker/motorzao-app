import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const consentimento = localStorage.getItem('motorzao_cookies');
    if (!consentimento) {
      setVisivel(true);
    }
  }, []);

  const aceitar = () => {
    localStorage.setItem('motorzao_cookies', 'true');
    setVisivel(false);
  };

  if (!visivel) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-[400px] z-[2000] bg-[#080808] border border-orange-600/30 p-8 rounded-[2.5rem] shadow-[0_0_80px_rgba(255,69,0,0.1)] animate-in slide-in-from-bottom-full duration-1000">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></div>
        <span className="text-[10px] font-black uppercase italic tracking-widest text-orange-600">Aviso de Privacidade</span>
      </div>
      <p className="text-[11px] text-gray-400 uppercase font-bold italic mb-8 leading-relaxed">
        Para acelerar sua experiência em nossa vitrine de <span className="text-white">Campinas</span>, utilizamos cookies. Ao continuar, você aceita nossos termos.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={aceitar} 
          className="flex-1 bg-white text-black text-[10px] font-[1000] uppercase italic py-5 rounded-2xl hover:bg-orange-600 hover:text-white transition-all active:scale-95"
        >
          ACEITAR
        </button>
        <button 
          onClick={() => window.location.href='/politica'} 
          className="px-6 text-[9px] text-gray-600 font-black uppercase italic hover:text-white transition-colors"
        >
          LER TERMOS
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;