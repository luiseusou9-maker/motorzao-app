import React from 'react';

const Politica = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-20 font-sans selection:bg-orange-600">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => window.location.href = '/'} 
          className="mb-12 text-orange-600 font-[1000] uppercase italic text-[10px] tracking-[0.3em] hover:text-white transition-colors"
        >
          ← VOLTAR AO PÁTIO
        </button>
        
        {/* SEÇÃO: QUEM SOMOS */}
        <section className="mb-24">
          <h1 className="text-6xl md:text-8xl font-[1000] italic uppercase tracking-tighter mb-8 leading-none">
            QUEM <span className="text-orange-600 text-shadow-xl">SOMOS</span>
          </h1>
          <div className="h-1 w-20 bg-orange-600 mb-10"></div>
          <p className="text-gray-400 text-xl leading-relaxed italic font-medium">
            O <span className="text-white font-black">MOTORZÃO</span> é a autoridade máxima em revenda de veículos em Campinas. 
            Nascemos para quebrar as barreiras do financiamento tradicional. 
            <br /><br />
            Somos especialistas em <span className="text-orange-600 font-black">NOTAS PROMISSÓRIAS</span> e parcerias bancárias agressivas. 
            Aqui em Campinas, selecionamos a dedo cada máquina do nosso pátio para garantir que você saia acelerando com segurança, transparência e o melhor preço da região.
          </p>
        </section>

        {/* SEÇÃO: POLÍTICAS E COOKIES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-white/5 pt-16">
          <section>
            <h2 className="text-2xl font-[1000] italic uppercase tracking-tighter mb-6">Privacidade</h2>
            <div className="text-gray-500 text-[11px] space-y-4 uppercase font-bold tracking-wider leading-relaxed">
              <p><span className="text-white">01. DADOS:</span> O login via Google serve exclusivamente para validar seu acesso às ofertas exclusivas.</p>
              <p><span className="text-white">02. WHATSAPP:</span> Suas negociações são diretas e criptografadas entre você e nossa equipe comercial.</p>
              <p><span className="text-white">03. SEGURANÇA:</span> Não compartilhamos informações. O que acontece no Motorzão, fica no Motorzão.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-[1000] italic uppercase tracking-tighter mb-6">Cookies</h2>
            <div className="text-gray-500 text-[11px] space-y-4 uppercase font-bold tracking-wider leading-relaxed">
              <p>Utilizamos cookies essenciais para que o site lembre das suas preferências de busca e do seu login, garantindo uma navegação fluida e rápida.</p>
              <p>Ao navegar em nossa vitrine, você concorda com a coleta de dados de performance para melhorarmos sua experiência em Campinas.</p>
            </div>
          </section>
        </div>

        <footer className="mt-32 pb-10 text-center border-t border-white/5 pt-10">
          <p className="text-gray-800 text-[9px] font-black uppercase tracking-[0.5em]">Motorzão Campinas • Eagle Ads Tech © 2026</p>
        </footer>
      </div>
    </div>
  );
};

export default Politica;