
import React, { useState } from 'react';
import { ClientProfile, ProspectEntry, QuoteConfig } from '../types';
import { calculateTotals } from '../utils';

interface QuoteEditorProps {
  profile: ClientProfile;
  onSave: (updatedProfile: ClientProfile, config: QuoteConfig) => void;
  onCancel: () => void;
}

export const QuoteEditor: React.FC<QuoteEditorProps> = ({ profile, onSave, onCancel }) => {
  const [items, setItems] = useState<ProspectEntry[]>(profile.items);
  const [config, setConfig] = useState<QuoteConfig>({
    marginPercent: 20,
    discountPercent: 0,
    materialTaxPercent: 20,
    installCost: 1500,
    installTaxPercent: 10
  });

  const updateItem = (id: string, field: keyof ProspectEntry, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    const newItem: ProspectEntry = {
      id: `manual-${Date.now()}`,
      client: profile.name,
      lieu: profile.siteName,
      adresse: profile.address,
      date: profile.visitDate,
      agent: "Manuel",
      appareil: "Nouvel Appareil",
      puissanceHoraireKWh: 0,
      puissanceMaxW: 0,
      dureeHj: 0,
      quantite: 1,
      unitPrice: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSubmit = () => {
    const totals = calculateTotals(items);
    onSave({ ...profile, items, ...totals }, config);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-900">Configuration du Devis</h2>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-500 font-medium">Annuler</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100">
            Voir l'Aperçu du Devis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des appareils */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Matériel & Consommation</h3>
              <button onClick={addItem} className="text-blue-600 text-sm font-bold flex items-center gap-1">
                <i className="fa-solid fa-plus"></i> Ajouter un appareil
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end border-b border-slate-50 pb-4">
                  <div className="col-span-4">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Désignation</label>
                    <input 
                      type="text" value={item.appareil} 
                      onChange={(e) => updateItem(item.id, 'appareil', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Puis. (W)</label>
                    <input 
                      type="number" value={item.puissanceMaxW} 
                      onChange={(e) => updateItem(item.id, 'puissanceMaxW', parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-lg text-sm p-2"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Qté</label>
                    <input 
                      type="number" value={item.quantite} 
                      onChange={(e) => updateItem(item.id, 'quantite', parseInt(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-lg text-sm p-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">P.U. HT (€)</label>
                    <input 
                      type="number" value={item.unitPrice} 
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border-none rounded-lg text-sm p-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Total HT</label>
                    <div className="text-sm font-bold text-slate-700 p-2">
                      {((item.unitPrice || 0) * item.quantite).toFixed(2)} €
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 p-2">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Commerciale */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-blue-400"></i> Paramètres Commerciaux
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Marge sur matériel (%)</label>
                <input 
                  type="range" min="0" max="100" value={config.marginPercent} 
                  onChange={(e) => setConfig({...config, marginPercent: parseInt(e.target.value)})}
                  className="w-full accent-blue-500"
                />
                <div className="text-right text-sm font-bold mt-1">{config.marginPercent}%</div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Remise Client (%)</label>
                <input 
                  type="number" value={config.discountPercent} 
                  onChange={(e) => setConfig({...config, discountPercent: parseFloat(e.target.value)})}
                  className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Coût Installation (€ HT)</label>
                <input 
                  type="number" value={config.installCost} 
                  onChange={(e) => setConfig({...config, installCost: parseFloat(e.target.value)})}
                  className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Taxes (TVA)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">TVA sur Matériel</span>
                <select 
                  value={config.materialTaxPercent}
                  onChange={(e) => setConfig({...config, materialTaxPercent: parseFloat(e.target.value)})}
                  className="text-sm font-bold border-none bg-slate-50 rounded-lg"
                >
                  <option value="20">20%</option>
                  <option value="10">10%</option>
                  <option value="5.5">5.5%</option>
                  <option value="0">Exonéré</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">TVA sur Installation</span>
                <select 
                  value={config.installTaxPercent}
                  onChange={(e) => setConfig({...config, installTaxPercent: parseFloat(e.target.value)})}
                  className="text-sm font-bold border-none bg-slate-50 rounded-lg"
                >
                  <option value="20">20%</option>
                  <option value="10">10%</option>
                  <option value="5.5">5.5%</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
