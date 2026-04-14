import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginModal from './LoginModal';
import CookieConsent from './CookieConsent'; // IMPORTADO

const Vitrine = ({ session }) => {
  const [estoque, setEstoque] = useState([]);
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [perfil, setPerfil] = useState({ nome: '', whatsapp: '', avatar: '' });
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [zoomFoto, setZoomFoto] = useState(null);

  const SEU_ZAP = "5519990181496";
  const isAdmin = session?.user?.email?.trim().toLowerCase() === 'luiseusou9@gmail.com';

  useEffect(() => {
    if (!session) {
      const timer = setTimeout(() => {
        setShowLogin(true);
      }, 10000);
      return () => clearTimeout(timer);
    }

    if (session) {
      const buscarPerfil = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        if (data) setPerfil({ nome: data.full_name || '', whatsapp: data.whatsapp || '', avatar: data.avatar_url || '' });
      };
      buscarPerfil();
      setShowLogin(false);
    }

    const carregar = async () => {
      const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
      setEstoque(data || []);
      setCarregando(false);
    };
    carregar();
  }, [session]);

  const salvarPerfil = async () => {
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id, full_name: perfil.nome, whatsapp: perfil.whatsapp, avatar_url: perfil.avatar, updated_at: new Date()
    });
    if (!error) alert("Perfil atualizado com sucesso!");
  };

  const filtrarCarros = estoque.filter(c => {
    const matchesFiltro = filtro === 'todos' || c.modalidade === filtro;
    const matchesBusca = c.modelo.toLowerCase().includes(busca.toLowerCase()) || c.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchesFiltro && matchesBusca;
  });

  if (carroSelecionado) {
    const c = carroSelecionado;
    const fotos = c.fotos || [];
    return (
      <div className="fixed inset-0 z-[400] bg-black overflow-y-auto animate-in slide-in-from-bottom duration-500">
        {zoomFoto && (
          <div onClick={() => setZoomFoto(null)} className="fixed inset-0 z-[1000] bg-black/98 flex items-center justify-center p-2 md:p-10 animate-in fade-in duration-300">
            <button className="absolute top-10 right-10 text-white text-2xl font-black">✕</button>
            <img src={zoomFoto} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Zoom" />
          </div>
        )}

        <div className="max-w-5xl mx-auto p-4 md:p-12">
          <button onClick={() => {setCarroSelecionado(null); setFotoAtiva(0);}} className="mb-6 text-[10px] font-[1000] uppercase text-orange-600 tracking-widest">← VOLTAR AO PÁTIO</button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="rounded-[2.5rem] overflow-hidden bg-white/5 aspect-video border border-white/5 cursor-zoom-in" onClick={() => setZoomFoto(fotos[fotoAtiva])}>
                <img src={fotos[fotoAtiva]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="Carro" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {fotos.map((img, idx) => (
                  <img key={idx} src={img} onClick={() => setFotoAtiva(idx)} className={`w-24 h-16 object-cover rounded-xl cursor-pointer border-2 transition-all ${fotoAtiva === idx ? 'border-orange-600 scale-95' : 'border-transparent opacity-50 hover:opacity-100'}`} />
                ))}
              </div>
              <p className="text-[8px] text-gray-600 uppercase font-bold italic text-center">Dica: Clique na foto para ampliar</p>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl font-[1000] italic uppercase leading-none mb-4 tracking-tighter">{c.modelo}</h2>
              <div className="flex gap-3 mb-6">
                <span className="bg-orange-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic shadow-lg shadow-orange-600/20">{c.modalidade}</span>
                <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic text-gray-400">{c.cambio}</span>
              </div>
              
              <p className="text-5xl md:text-6xl font-mono font-[1000] text-[#00FF00] mb-8 tracking-tighter italic whitespace-nowrap">
                R$ {c.preco?.toLocaleString('pt-BR')}
              </p>

              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 mb-8">
                <p className="text-gray-400 text-sm leading-relaxed italic">{c.descricao}</p>
              </div>
              <a href={`https://wa.me/${SEU_ZAP}?text=Olá! Gostaria de mais informações sobre o ${c.modelo} que vi no Motorzão.`} target="_blank" className="w-full bg-[#25D366] text-black font-[1000] py-6 rounded-2xl text-center text-sm uppercase italic shadow-2xl hover:scale-[1.02] transition-transform">Negociar via WhatsApp</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-600">
      <nav className="sticky top-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-[1000] italic tracking-tighter cursor-pointer" onClick={() => window.location.reload()}>MOTOR<span className="text-orange-600">ZÃO</span></h1>
        <div className="flex gap-3 items-center">
          {isAdmin && <button onClick={() => window.location.href='/PDV'} className="text-[9px] font-black bg-orange-600/10 border border-orange-600/40 px-4 py-2 rounded-xl text-orange-500 uppercase italic">Painel Admin</button>}
          {session ? (
            <div onClick={() => setShowPerfil(true)} className="flex items-center gap-2 bg-white/5 p-1 pr-4 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
              <img src={perfil.avatar || `https://ui-avatars.com/api/?name=${perfil.nome || 'User'}`} className="w-8 h-8 rounded-full border-2 border-orange-600 object-cover" />
              <span className="text-[9px] font-black uppercase italic">{perfil.nome?.split(' ')[0] || 'PERFIL'}</span>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="text-[10px] font-black uppercase italic bg-white text-black px-6 py-2 rounded-xl">Entrar</button>
          )}
        </div>
      </nav>

      {/* HEADER ATUALIZADO NO GRAU */}
      <header className="pt-16 pb-12 px-6 text-center max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-[1000] italic uppercase leading-[0.9] tracking-tighter mb-8 bg-gradient-to-b from-white via-white to-gray-600 bg-clip-text text-transparent">
          O CARRO DOS <br /> 
          <span className="text-orange-600 drop-shadow-[0_0_30px_rgba(234,88,12,0.3)]">
            SEUS SONHOS.
          </span>
        </h2>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <button onClick={() => setFiltro('todos')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase italic border transition-all ${filtro === 'todos' ? 'bg-white text-black' : 'border-white/10 text-gray-500'}`}>Estoque</button>
            <button onClick={() => setFiltro('promissoria')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase italic border transition-all ${filtro === 'promissoria' ? 'bg-orange-600 border-orange-600 text-white' : 'border-orange-600/30 text-orange-600'}`}>📝 Promissória</button>
            <button onClick={() => setFiltro('financiamento')} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase italic border transition-all ${filtro === 'financiamento' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-600/30 text-blue-600'}`}>🏦 Financiamento</button>
          </div>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Pesquisar por modelo ou marca..." 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[11px] outline-none focus:border-orange-600 text-center italic transition-all" 
              value={busca} 
              onChange={(e) => setBusca(e.target.value)} 
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
        {carregando ? (
          <p className="col-span-full text-center text-[10px] font-black text-gray-800 uppercase animate-pulse py-20 tracking-[1em]">Alinhando Estoque...</p>
        ) : filtrarCarros.map(carro => (
          <div key={carro.id} onClick={() => setCarroSelecionado(carro)} className="bg-[#080808] border border-white/5 rounded-[2.5rem] overflow-hidden group cursor-pointer hover:border-orange-600/40 transition-all duration-500 shadow-2xl hover:-translate-y-2">
            <div className="h-60 relative overflow-hidden">
              <img src={carro.fotos?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={carro.modelo} />
              <div className={`absolute top-6 right-6 px-4 py-1 rounded-full text-[8px] font-[1000] uppercase italic shadow-2xl ${carro.modalidade === 'promissoria' ? 'bg-orange-600' : 'bg-blue-600'}`}>{carro.modalidade}</div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-[1000] uppercase italic mb-2 truncate tracking-tighter group-hover:text-orange-600 transition-colors">{carro.modelo}</h3>
              <p className="text-3xl font-mono font-black text-[#00FF00] mb-6 italic tracking-tighter leading-none">R$ {carro.preco?.toLocaleString('pt-BR')}</p>
              <div className="flex justify-between items-center text-[8px] font-black text-gray-600 uppercase border-t border-white/5 pt-6 group-hover:text-white transition-all">
                <span>{carro.quilometragem?.toLocaleString()} KM • {carro.cambio}</span>
                <span className="text-orange-600 italic tracking-widest">VER DETALHES →</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {showPerfil && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-[3rem] p-10 space-y-6 relative">
            <button onClick={() => setShowPerfil(false)} className="absolute top-8 right-8 text-gray-600 font-black">✕</button>
            <div className="text-center">
              <img src={perfil.avatar || `https://ui-avatars.com/api/?name=${perfil.nome}`} className="w-24 h-24 rounded-full border-4 border-orange-600 mx-auto object-cover mb-4 shadow-2xl shadow-orange-600/20" />
              <input type="text" placeholder="URL da Foto de Perfil" className="w-full bg-black border border-white/10 rounded-xl p-2 text-[8px] text-center mb-4 italic" value={perfil.avatar} onChange={(e) => setPerfil({...perfil, avatar: e.target.value})} />
              <h3 className="text-xl font-black uppercase italic">Configurações</h3>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Nome Completo" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-xs outline-none focus:border-orange-600" value={perfil.nome} onChange={(e) => setPerfil({...perfil, nome: e.target.value})} />
              <input type="text" placeholder="WhatsApp (DDD + Número)" className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-xs outline-none focus:border-orange-600" value={perfil.whatsapp} onChange={(e) => setPerfil({...perfil, whatsapp: e.target.value})} />
            </div>
            <button onClick={salvarPerfil} className="w-full bg-orange-600 text-white font-[1000] py-5 rounded-2xl text-[10px] uppercase italic shadow-2xl shadow-orange-600/20">Salvar Alterações</button>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="w-full text-gray-700 font-black text-[9px] uppercase tracking-widest">Sair da Sessão</button>
          </div>
        </div>
      )}

      <footer className="bg-[#050505] border-t border-white/5 py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-2xl font-[1000] italic tracking-tighter">MOTOR<span className="text-orange-600">ZÃO</span></h1>
          <div className="flex flex-wrap justify-center gap-8 text-[9px] font-black text-gray-600 uppercase italic">
            <a href="/politica" className="hover:text-white transition-colors">Quem Somos</a>
            <a href="/politica" className="hover:text-white transition-colors">Privacidade</a>
            <a href="/politica" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <div className="pt-4">
            <p className="text-gray-800 text-[8px] font-black uppercase tracking-[0.5em] mb-2">Eagle Ads Tech © 2026 • Todos os direitos reservados</p>
            <p className="text-orange-600/50 text-[7px] font-black uppercase tracking-[0.8em] animate-pulse">DEVELOPER LUIS</p>
          </div>
        </div>
      </footer>

      <CookieConsent />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
};

export default Vitrine;