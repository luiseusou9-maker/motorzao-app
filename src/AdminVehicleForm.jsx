import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AdminVehicleForm = ({ onCreated }) => {
  const [lojas, setLojas] = useState([]);
  const [formData, setFormData] = useState({
    loja_id: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    preco: '',
    quilometragem: '',
    status: 'disponivel'
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLojas = async () => {
      const { data } = await supabase.from('lojas_internas').select('id, nome_loja');
      if (data) {
        setLojas(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, loja_id: data[0].id }));
      }
    };
    fetchLojas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const uploadedUrls = [];
    try {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('veiculos').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('veiculos').getPublicUrl(filePath);
        uploadedUrls.push(publicUrlData.publicUrl);
      }
      const payload = {
        ...formData,
        preco: parseFloat(formData.preco),
        quilometragem: parseInt(formData.quilometragem),
        fotos: uploadedUrls
      };
      const { error } = await supabase.from('veiculos').insert([payload]);
      if (error) {
        alert('Erro ao cadastrar: ' + error.message);
      } else {
        alert('Veículo cadastrado com sucesso!');
        onCreated();
      }
    } catch (err) {
      alert('Erro no processo: ' + err.message);
    }
    setLoading(false);
  };

  const inputStyle = "bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#FF0000] outline-none text-white w-full transition-all";
  const labelStyle = "text-xs font-bold text-gray-500 uppercase mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className={labelStyle}>Loja Parceira</label>
        <select className={inputStyle} value={formData.loja_id} onChange={(e) => setFormData({...formData, loja_id: e.target.value})} required>
          {lojas.map(loja => (
            <option key={loja.id} value={loja.id} className="bg-black">{loja.nome_loja}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelStyle}>Marca</label>
        <input type="text" className={inputStyle} placeholder="Ex: Honda" required value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} />
      </div>
      <div>
        <label className={labelStyle}>Modelo</label>
        <input type="text" className={inputStyle} placeholder="Ex: Civic Touring" required value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelStyle}>Ano</label>
          <input type="number" className={inputStyle} required value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} />
        </div>
        <div>
          <label className={labelStyle}>KM</label>
          <input type="number" className={inputStyle} required value={formData.quilometragem} onChange={e => setFormData({...formData, quilometragem: e.target.value})} />
        </div>
      </div>
      <div>
        <label className={labelStyle}>Preço (R$)</label>
        <input type="number" step="0.01" className={inputStyle} placeholder="0.00" required value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} />
      </div>
      <div>
        <label className={labelStyle}>Fotos do Veículo</label>
        <input type="file" className={inputStyle} multiple accept="image/*" onChange={e => setImageFiles(Array.from(e.target.files))} />
      </div>
      <div className="md:col-span-2">
        <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'PROCESSANDO...' : 'PUBLICA VEÍCULO'}
        </button>
      </div>
    </form>
  );
};

export default AdminVehicleForm;