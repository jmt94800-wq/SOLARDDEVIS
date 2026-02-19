
import { useEffect, useState } from 'react';
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
  
  const specs = calculateSolarSpecs(profile.totalDailyKWh, config.panelPowerW, config.efficiencyPercent);

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

  const materialMarginMultiplier = 1 + (config.marginPercent / 100);
  const allItems = profile.items;
  
  const totalMaterialHT_Base = Math.round(allItems.reduce((sum, i) => sum + ((i.unitPrice || 0) * i.quantite * materialMarginMultiplier), 0) * 100) / 100;
  const discountAmount = Math.round(totalMaterialHT_Base * (config.discountPercent / 100) * 100) / 100;
  const totalMaterialAfterDiscount = totalMaterialHT_Base - discountAmount;
  const materialTax = Math.round(totalMaterialAfterDiscount * (config.materialTaxPercent / 100) * 100) / 100;
  
  const installTax = Math.round(config.installCost * (config.installTaxPercent / 100) * 100) / 100;
  const grandTotal = totalMaterialAfterDiscount + materialTax + config.installCost + installTax;

  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      <div className="no-print mb-4 flex justify-between items-center">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-bold text-sm uppercase tracking-wider"
        >
          <i className="fa-solid fa-chevron-left"></i> Retour à l'édition
        </button>
        <button 
          onClick={handlePrint}
          className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-print"></i> Imprimer le Devis
        </button>
      </div>

      <div className="bg-white shadow-xl overflow-hidden border border-slate-100 quote-container" id="printable-quote">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-600 p-1.5 rounded-lg no-print">
                <i className="fa-solid fa-sun text-white text-xs"></i>
              </div>
              <h1 className="text-xl font-black text-slate-900">SolarDevis <span className="text-blue-600">Pro</span></h1>
            </div>
            <p className="text-[10px] text-slate-400 max-w-xs font-medium uppercase tracking-tighter">Expertise Solaire Haïti • Audit certifié</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-800 mb-0">DEVIS</h2>
            <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">PROPOSITION COMMERCIALE</p>
            <p className="text-slate-400 text-[8px] mt-1 uppercase tracking-widest font-black">Réf: {Math.floor(Math.random() * 100000).toString().padStart(6, '0')} • {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Client</h3>
              <p className="text-base font-black text-slate-800">{profile.name}</p>
              <p className="text-slate-600 mt-1 text-xs leading-relaxed">{profile.address}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{profile.siteName}</p>
            </div>
            <div className="text-right">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Émetteur</h3>
              <p className="text-sm font-bold text-slate-800">Expert Solaire Certifié</p>
              <p className="text-slate-500 text-[10px]">Bureau d'études photovoltaïques</p>
              <p className="text-slate-400 text-[9px] mt-1 uppercase tracking-tighter font-medium">HSP: 5.2 | Rendement: {config.efficiencyPercent}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Dimensionnement Système</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-blue-600">{specs.neededKWp.toFixed(2)}</span>
                <span className="text-sm font-bold text-slate-600">kWc</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 font-medium">
                Besoin corrigé : <span className="text-slate-800 font-bold">{specs.panelCount}</span> panneaux de {config.panelPowerW}W.
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Consommation Étudiée</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-orange-600">{profile.totalDailyKWh.toFixed(2)}</span>
                <span className="text-sm font-bold text-slate-600">kWh / jour</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 font-medium">Pic critiques : <span className="text-slate-800 font-bold">{profile.totalMaxW} W</span></p>
            </div>
          </div>

          <div className="mb-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-2 text-[8px] uppercase font-black text-slate-900">Désignation Appareil</th>
                  <th className="py-2 text-center text-[8px] uppercase font-black text-slate-900">Puissance</th>
                  <th className="py-2 text-center text-[8px] uppercase font-black text-slate-900">Qté</th>
                  <th className="py-2 text-right text-[8px] uppercase font-black text-slate-900">P.U. ($ HT)</th>
                  <th className="py-2 text-right text-[8px] uppercase font-black text-slate-900">Total ($ HT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {profile.items.map((item, i) => {
                  const displayUnitPrice = Math.round((item.unitPrice || 0) * materialMarginMultiplier * 100) / 100;
                  const isExcludedFromSizing = !item.inclusPuisCrete;
                  
                  return (
                    <tr key={i} className={isExcludedFromSizing ? 'bg-slate-50/50' : ''}>
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{item.appareil}</div>
                        {isExcludedFromSizing && (
                          <span className="text-[7px] font-black uppercase text-slate-400 bg-slate-100 px-1 py-0.5 rounded tracking-tighter">Hors dimensionnement</span>
                        )}
                      </td>
                      <td className="py-3 text-center text-slate-600 font-medium">{item.puissanceMaxW > 0 ? `${item.puissanceMaxW} W` : '-'}</td>
                      <td className="py-3 text-center text-slate-600 font-bold">{item.quantite}</td>
                      <td className="py-3 text-right text-slate-600 font-medium">
                        {displayUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                      </td>
                      <td className="py-3 text-right font-black text-slate-900">
                        {(displayUnitPrice * item.quantite).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                      </td>
                    </tr>
                  )
                })}
                {config.installCost > 0 && (
                  <tr className="bg-blue-50/10">
                    <td className="py-3 font-bold text-slate-800 italic">Installation & Mise en service</td>
                    <td className="py-3 text-center text-slate-600">-</td>
                    <td className="py-3 text-center text-slate-600">1</td>
                    <td className="py-3 text-right text-slate-600 font-medium">{config.installCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</td>
                    <td className="py-3 text-right font-black text-slate-900">{config.installCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-slate-600 font-medium text-[11px]">
                <span>Sous-total Matériel HT</span>
                <span>{totalMaterialHT_Base.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
              </div>
              
              {config.discountPercent > 0 && (
                <div className="flex justify-between text-blue-700 font-black bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 text-[11px]">
                  <span>Remise ({config.discountPercent}%)</span>
                  <span>- {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
                </div>
              )}

              <div className="pt-1 border-t border-slate-100 space-y-1 text-[10px] font-medium text-slate-500">
                <div className="flex justify-between">
                  <span>TVA Matériel ({config.materialTaxPercent}%)</span>
                  <span>{materialTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA Installation ({config.installTaxPercent}%)</span>
                  <span>{installTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center">
                <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">Total Net à payer</span>
                <span className="text-base font-black text-blue-600">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-10 pt-4 border-t border-slate-100 print-only">
            <div className="text-slate-400 text-[8px] italic leading-tight">
              Ce devis est une proposition commerciale soumise à acceptation. Validité : 30 jours. La TCA est appliquée selon la réglementation haïtienne.
            </div>
            <div className="space-y-6">
              <div className="flex justify-between text-[8px] font-black text-slate-900 uppercase tracking-widest">
                <span>Bon pour accord</span>
                <span>Le ___ / ___ / 202___</span>
              </div>
              <div className="h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[8px] text-slate-300 font-black uppercase tracking-[0.2em]">
                Signature
              </div>
            </div>
          </div>

          <div className="mt-8 no-print border-t border-slate-100 pt-6">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles text-blue-500 text-sm"></i> Analyse IA
            </h3>
            {loading ? (
              <div className="flex items-center gap-2 text-slate-400 animate-pulse font-bold text-xs">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Analyse en cours...
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-6 text-slate-700 leading-relaxed shadow-inner border border-slate-100 prose prose-slate max-w-none text-xs">
                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br/>') }} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-6 flex justify-between items-center no-print">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-solar-panel text-blue-400 text-sm"></i>
             </div>
             <div>
                <p className="text-white text-[10px] font-black uppercase tracking-widest italic">SolarDevis Pro Haiti</p>
                <p className="text-slate-500 text-[8px] font-bold">DIMENSIONNEMENT ASHRAE</p>
             </div>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black text-xs transition-all shadow-xl shadow-blue-900/40 flex items-center gap-3 group"
          >
            <i className="fa-solid fa-file-pdf group-hover:scale-110 transition-transform"></i> Finaliser & Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};
