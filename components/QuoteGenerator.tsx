
import React, { useEffect, useState } from 'react';
import { ClientProfile, QuoteConfig } from '../types';
import { calculateSolarSpecs } from '../utils';
import { getEnergyAnalysis } from '../geminiService';

interface QuoteGeneratorProps {
  profile: ClientProfile;
  config: QuoteConfig;
  onBack: () => void;
}

export const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ profile, config, onBack }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const specs = calculateSolarSpecs(profile.totalDailyKWh);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const res = await getEnergyAnalysis(profile);
      setAnalysis(res || '');
      setLoading(false);
    };
    fetchAnalysis();
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  // Calculs financiers
  const materialMarginMultiplier = 1 + (config.marginPercent / 100);
  const totalMaterialHT_Base = profile.items.reduce((sum, i) => sum + ((i.unitPrice || 0) * i.quantite * materialMarginMultiplier), 0);
  const discountAmount = totalMaterialHT_Base * (config.discountPercent / 100);
  const totalMaterialAfterDiscount = totalMaterialHT_Base - discountAmount;
  const materialTax = totalMaterialAfterDiscount * (config.materialTaxPercent / 100);
  
  const installTax = config.installCost * (config.installTaxPercent / 100);
  const grandTotal = totalMaterialAfterDiscount + materialTax + config.installCost + installTax;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button 
        onClick={onBack}
        className="no-print mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
      >
        <i className="fa-solid fa-arrow-left"></i> Modifier le devis
      </button>

      <div className="bg-white shadow-2xl overflow-hidden border border-slate-100 quote-container" id="printable-quote">
        {/* En-tête Identité */}
        <div className="p-10 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg no-print">
                <i className="fa-solid fa-sun text-white"></i>
              </div>
              <h1 className="text-2xl font-black text-slate-900">SolarDevis <span className="text-blue-600">Pro</span></h1>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">Solution d'énergie renouvelable sur mesure pour les professionnels et particuliers.</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800 mb-1">DEVIS</h2>
            <p className="text-slate-500 font-medium">#{Math.floor(Math.random() * 100000).toString().padStart(6, '0')}</p>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-bold">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="p-10">
          {/* Informations Client */}
          <div className="grid grid-cols-2 gap-20 mb-12">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Client</h3>
              <p className="text-xl font-black text-slate-800">{profile.name}</p>
              <p className="text-slate-600 mt-2 leading-relaxed">{profile.address}</p>
              <p className="text-slate-500 text-sm mt-1">{profile.siteName}</p>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Conseiller</h3>
              <p className="text-lg font-bold text-slate-800">Expert Solaire</p>
              <p className="text-slate-500">contact@solardevis-pro.com</p>
            </div>
          </div>

          {/* Dimensionnement & Consommation (Position demandée) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Dimensionnement Suggéré</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-600">{specs.neededKWp}</span>
                <span className="text-lg font-bold text-slate-600">kWc</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Basé sur une installation de {specs.panelCount} panneaux (425W).</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Total Consommation Journalière</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-orange-600">{profile.totalDailyKWh.toFixed(2)}</span>
                <span className="text-lg font-bold text-slate-600">kWh / j</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Puissance de crête estimée : {profile.totalMaxW} W</p>
            </div>
          </div>

          {/* Tableau du Devis */}
          <div className="mb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-4 text-[10px] uppercase font-black text-slate-900">Désignation Appareil</th>
                  <th className="py-4 text-center text-[10px] uppercase font-black text-slate-900">Puissance (Wh)</th>
                  <th className="py-4 text-center text-[10px] uppercase font-black text-slate-900">Qté</th>
                  <th className="py-4 text-right text-[10px] uppercase font-black text-slate-900">P.U. (€ HT)</th>
                  <th className="py-4 text-right text-[10px] uppercase font-black text-slate-900">Total HT (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.items.map((item, i) => {
                  const displayUnitPrice = (item.unitPrice || 0) * materialMarginMultiplier;
                  return (
                    <tr key={i}>
                      <td className="py-5 font-bold text-slate-800">{item.appareil}</td>
                      <td className="py-5 text-center text-slate-600">{item.puissanceMaxW}</td>
                      <td className="py-5 text-center text-slate-600">{item.quantite}</td>
                      <td className="py-5 text-right text-slate-600">{displayUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</td>
                      <td className="py-5 text-right font-bold text-slate-800">{(displayUnitPrice * item.quantite).toLocaleString(undefined, { minimumFractionDigits: 2 })} €</td>
                    </tr>
                  )
                })}
                {config.installCost > 0 && (
                  <tr>
                    <td className="py-5 font-bold text-slate-800">Forfait Installation & Mise en service</td>
                    <td className="py-5 text-center text-slate-600">-</td>
                    <td className="py-5 text-center text-slate-600">1</td>
                    <td className="py-5 text-right text-slate-600">{config.installCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</td>
                    <td className="py-5 text-right font-bold text-slate-800">{config.installCost.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totaux & Taxes */}
          <div className="flex justify-end mb-20">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Total Matériel HT</span>
                <span>{totalMaterialHT_Base.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
              </div>
              
              {config.discountPercent > 0 && (
                <div className="flex justify-between text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">
                  <span>Réduction de {config.discountPercent}%</span>
                  <span>- {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-2 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span>TVA sur Matériel ({config.materialTaxPercent}%)</span>
                  <span>{materialTax.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA sur Installation ({config.installTaxPercent}%)</span>
                  <span>{installTax.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                <span className="text-xl font-black text-slate-900 uppercase">Total TTC</span>
                <span className="text-2xl font-black text-blue-600">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>

          {/* Bloc Approbation & Signature */}
          <div className="grid grid-cols-2 gap-10 mt-20 pt-10 border-t border-slate-100 print-only">
            <div className="text-slate-400 text-[10px] italic">
              Bon pour accord. Faire précéder la signature de la mention "Lu et approuvé".
            </div>
            <div className="space-y-12">
              <div className="flex justify-between text-xs font-bold text-slate-800 uppercase">
                <span>Signature Client</span>
                <span>Fait le : ___ / ___ / 202___</span>
              </div>
              <div className="h-24 border border-dashed border-slate-200 rounded-xl"></div>
            </div>
          </div>

          {/* AI Analysis (Caché à l'impression si besoin, mais ici conservé en bas) */}
          <div className="mt-12 no-print border-t border-slate-100 pt-8">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles text-purple-600"></i> Analyse Experte IA
            </h3>
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Génération de l'analyse...
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-8 text-slate-700 leading-relaxed prose prose-slate max-w-none shadow-inner">
                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>') }} />
              </div>
            )}
          </div>
        </div>

        {/* Pied de page actions */}
        <div className="bg-slate-900 p-8 flex justify-between items-center no-print">
          <p className="text-slate-400 text-xs">SolarDevis Pro v2.0 • Devis valable 30 jours</p>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black transition-all shadow-xl flex items-center gap-3"
          >
            <i className="fa-solid fa-file-pdf"></i> Enregistrer en PDF / Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};
