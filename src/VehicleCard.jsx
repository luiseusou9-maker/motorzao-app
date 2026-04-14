import React from 'react';

const VehicleCard = ({ veiculo }) => {
  const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá Motorzão! Vi o ${veiculo.modelo} no site e quero saber mais. (ID: ${veiculo.id})`)}`;

  return (
    <div className="glass-card flex flex-col w-full">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={veiculo.fotos[0] || 'https://via.placeholder.com/400x300'} 
          alt={veiculo.modelo}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-[#FF0000] px-3 py-1 rounded-full text-xs font-bold border border-[#FF0000]">
          {veiculo.ano}
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-1">
        <h3 className="text-xl font-black uppercase italic">{veiculo.marca} {veiculo.modelo}</h3>
        <p className="text-gray-400 text-sm">Campinas • {veiculo.quilometragem.toLocaleString()} km</p>
        <span className="text-2xl font-bold text-[#FF0000] mt-2">
          R$ {veiculo.preco.toLocaleString('pt-BR')}
        </span>
        
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary mt-4 text-center text-sm">
          NEGOCIAR AGORA
        </a>
      </div>
    </div>
  );
};

export default VehicleCard;