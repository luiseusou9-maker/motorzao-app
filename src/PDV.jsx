import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const PDV = ({ session }) => {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [capturando, setCapturando] = useState(false);
  
  const [novoCarro, setNovoCarro] = useState({ 
    nome: '', preco: '', km: '', cambio: 'Manual', 
    combustivel: 'Flex', modalidade: 'financiamento', 
    descricao: '', link_fonte: '', zap_loja: '', nome_estacionamento: '',
    img1: '', img2: '', img3: '', img4: '', img5: '', img6: ''
  });

  if (session?.user?.email !== 'luiseusou9@gmail.com') {
    window.location.href = '/';
    return null;
  }

  const carregarEstoque = async () => {
    const { data } = await supabase.from('cars').select('*').order('loja_nome', { ascending: true });
    if (data) setCarros(data);
  };

  useEffect(() => { carregarEstoque(); }, []);

  // --- EXTRAÇÃO COM TÚNEL DUPLO (FURA-BLOQUEIO) ---
  const dissecarLink = async () => {
    if (!novoCarro.link_fonte) return alert("Por favor, insira o link do veículo.");
    setCapturando(true);
    
    let html = null;
    const t = new Date().getTime();

    // TENTATIVA 1: ALLORIGINS (COM CACHE BUSTER)
    try {
      const resp1 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(novoCarro.link_fonte)}&timestamp=${t}`);
      if (resp1.ok) {
        const data1 = await resp1.json();
        html = data1.contents;
      }
    } catch (e) { console.log("Túnel 1 falhou, tentando Túnel 2..."); }

    // TENTATIVA 2: CORSPROXY (SE O 1 FALHAR OU VIER VAZIO)
    if (!html) {
      try {
        const resp2 = await fetch(`https://corsproxy.io/?${encodeURIComponent(novoCarro.link_fonte)}`);
        if (resp2.ok) {
          html = await resp2.text();
        }
      } catch (e) { console.log("Túnel 2 falhou também."); }
    }
    
    if (!html) {
      setCapturando(false);
      return alert("O site de origem bloqueou o acesso automático. Tente colar o link novamente ou preencha os campos abaixo manualmente.");
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const titulo = doc.querySelector('h1')?.innerText || doc.title?.split('|')[0]?.split('-')[0] || "VEÍCULO CATALOGADO";
      const precoMatch = html.match(/R\$\s?([0-9.]+,[0-9]{2}|[0-9.]+)/i);
      
      const imagensFiltradas = Array.from(doc.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => {
          const isUrlValida = src.includes('http') && src.length > 65;
          const isNotLogo = !src.toLowerCase().match(/logo|icon|banner|avatar|social|header|footer/);
          return isUrlValida && isNotLogo;
        });

      const descProfissional = `✅ ${titulo.toUpperCase()}\n\nVeículo disponível em nosso estoque. Unidade periciada, com garantia de procedência e excelente estado de conservação.`;

      setNovoCarro(prev => ({
        ...prev,
        nome: titulo.toUpperCase().trim(),
        preco: precoMatch ? precoMatch[1] : '',
        descricao: descProfissional,
        img1: imagensFiltradas[0] || '',
        img2: imagensFiltradas[1] || '',
        img3: imagensFiltradas[2] || '',
        img4: imagensFiltradas[3] || '',
        img5: imagensFiltradas[4] || '',
        img6: imagensFiltradas[5] || '',
      }));

      alert("Captura realizada! Se algum campo ficou vazio, complete na mão.");

    } catch (e) {
      alert("Erro ao processar as informações do site.");
    } finally {
      setCapturando(false);
    }
  };

  const adicionarCarro = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fotos = [novoCarro.img1, novoCarro.img2, novoCarro.img3, novoCarro.img4, novoCarro.img5, novoCarro.img6].filter(u => u !== '');
    
    await supabase.from('cars').insert([{
      modelo: novoCarro.nome,
      preco: parseFloat(novoCarro.preco.replace('.', '').replace(',', '.')),
      quilometragem: parseInt(novoCarro.km) || 0,
      cambio: novoCarro.cambio,
      combustivel: novoCarro.combustivel,
      fotos: fotos,
      descricao: novoCarro.descricao,
      modalidade: novoCarro.modalidade,
      loja_nome: novoCarro.nome_estacionamento,
      zap_origem: novoCarro.zap_loja
    }]);

    setNovoCarro({ 
      ...novoCarro,
      nome: '', preco: '', km: '', cambio: 'Manual', 
      img1: '', img2: '', img3: '', img4: '', img5: '', img6: '',
      link_fonte: '', descricao: '' 
    });
    
    carregarEstoque();
    setLoading(false);
  };

  const lojasUnicas = [...new Set(carros.map(c => c.loja_nome))];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-8 bg-gradient-to-r from-orange-600 to-red-600 p-[1px] rounded-3xl shadow-[0_0_30px_rgba(234,88,12,0.2)]">
          <div className="bg-black p-6 rounded-[1.7rem] flex flex-col md:flex-row gap-4">
            <input 
              placeholder="COLE O LINK DO VEÍCULO AQUI" 
              className="flex-1 bg-transparent border-none text-orange-500 font-mono text-xs outline-none"
              value={novoCarro.link_fonte}
              onChange={e => setNovoCarro({...novoCarro, link_fonte: e.target.value})}
            />
            <button onClick={dissecarLink} className="bg-orange-600 hover:bg-orange-500 text-white font-black px-8 py-3 rounded-xl text-[10px] uppercase italic transition-all">
              {capturando ? 'FURANDO BLOQUEIO...' : 'CAPTURAR MÁQUINA'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={adicionarCarro} className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-white/5 space-y-4 h-fit sticky top-6">
            <h2 className="text-[10px] font-black uppercase text-orange-600 italic tracking-widest">Ficha de Entrada</h2>
            
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-gray-500 uppercase ml-2">Identificação do Pátio</label>
              <input type="text" placeholder="Escreva o Nome da Loja" value={novoCarro.nome_estacionamento} onChange={e => setNovoCarro({...novoCarro, nome_estacionamento: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl text-xs border border-orange-600/20 outline-none focus:border-orange-600 font-bold" required />
            </div>
            
            <input type="text" placeholder="Modelo do Veículo" value={novoCarro.nome} onChange={e => setNovoCarro({...novoCarro, nome: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl text-xs border border-white/10 outline-none focus:border-orange-600" required />
            
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Preço (Ex: 45.900)" value={novoCarro.preco} onChange={e => setNovoCarro({...novoCarro, preco: e.target.value})} className="bg-white/5 p-4 rounded-xl text-xs border border-white/10 outline-none focus:border-orange-600" required />
              <input type="number" placeholder="KM Real" value={novoCarro.km} onChange={e => setNovoCarro({...novoCarro, km: e.target.value})} className="bg-white/5 p-4 rounded-xl text-xs border border-white/10 outline-none focus:border-orange-600" required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select value={novoCarro.cambio} onChange={e => setNovoCarro({...novoCarro, cambio: e.target.value})} className="bg-black p-4 rounded-xl text-[10px] font-black uppercase border border-white/10 text-orange-500">
                <option value="Manual">Câmbio Manual</option>
                <option value="Automático">Câmbio Automático</option>
              </select>
              <select value={novoCarro.modalidade} onChange={e => setNovoCarro({...novoCarro, modalidade: e.target.value})} className="bg-black p-4 rounded-xl text-[10px] font-black uppercase border border-white/10">
                <option value="financiamento">Financiamento</option>
                <option value="promissoria">Promissória</option>
              </select>
            </div>

            <input type="text" placeholder="WhatsApp p/ Contato" value={novoCarro.zap_loja} onChange={e => setNovoCarro({...novoCarro, zap_loja: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl text-[10px] border border-white/10 outline-none" />

            <textarea value={novoCarro.descricao} onChange={e => setNovoCarro({...novoCarro, descricao: e.target.value})} className="w-full bg-white/5 p-4 rounded-xl text-[10px] h-32 border border-white/10 italic text-gray-400" />

            <button type="submit" className="w-full bg-white text-black font-[1000] py-5 rounded-2xl text-[11px] uppercase italic hover:bg-orange-600 hover:text-white transition-all shadow-xl">
              {loading ? 'PUBLICANDO...' : 'COLOCAR NO PÁTIO AGORA'}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-12">
            {lojasUnicas.map(loja => (
              <div key={loja} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-black uppercase italic text-orange-600 tracking-tighter">{loja || 'Pátio não definido'}</h3>
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                  <span className="text-[10px] text-gray-600 font-bold uppercase">{carros.filter(c => c.loja_nome === loja).length} MÁQUINAS</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {carros.filter(c => c.loja_nome === loja).map(c => (
                    <div key={c.id} className="bg-[#0a0a0a] p-4 rounded-3xl border border-white/5 flex gap-4 items-center group relative overflow-hidden">
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-white/5">
                        <img src={c.fotos?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase italic leading-none mb-1">{c.modelo}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">{c.quilometragem?.toLocaleString()} KM • {c.cambio}</p>
                        <p className="text-[12px] font-mono font-bold text-[#00FF00]">R$ {c.preco?.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={async () => { if(confirm('Remover da vitrine?')) { await supabase.from('cars').delete().eq('id', c.id); carregarEstoque(); } }}
                        className="bg-red-600/10 text-red-600 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDV;