
import { GoogleGenAI } from "@google/genai";
import { ClientProfile, QuoteConfig } from "./types";

export const getEnergyAnalysis = async (profile: ClientProfile, config: QuoteConfig, grandTotal: number) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "### ⚠️ Clé API manquante\n\nVeuillez configurer votre clé API pour bénéficier de l'analyse IA.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      En tant qu'expert en énergie solaire pour le marché d'Haïti (HSP moyen 5.2), analyse ce DEVIS COMPLET.
      
      INFOS CLIENT & SITE:
      - Client: ${profile.name}
      - Adresse: ${profile.address}
      
      DONNÉES TECHNIQUES:
      - Consommation journalière étudiée: ${profile.totalDailyKWh.toFixed(2)} kWh/j
      - Puissance de crête (onduleur requis): ${profile.totalMaxW} W
      - Rendement système configuré: ${config.efficiencyPercent}%
      - Puissance panneaux utilisés: ${config.panelPowerW}W
      
      DÉTAILS FINANCIERS DU DEVIS:
      - Montant Total Net (Taxes incluses): ${grandTotal.toLocaleString()} $
      - Coût Installation: ${config.installCost} $
      - Marge matériel appliquée: ${config.marginPercent}%
      - Remise accordée: ${config.discountPercent}%
      
      ARTICLES PROPOSÉS (Quantité > 0):
      ${profile.items.filter(i => i.quantite > 0).map(i => `- ${i.appareil}: Qte ${i.quantite}, P.U. ${i.unitPrice}$`).join('\n')}

      TRAVAIL DEMANDÉ:
      1. VÉRIFICATION DE COHÉRENCE : Le montant total de ${grandTotal}$ est-il réaliste pour un système de cette puissance en Haïti ?
      2. ANALYSE TECHNIQUE : L'onduleur et les panneaux (selon les kWh/j) sont-ils bien proportionnés ?
      3. RENTABILITÉ : En combien d'années ce système à ${grandTotal}$ sera-t-il rentabilisé par rapport à un coût du kWh réseau/génératrice à 0.50$ ?
      4. RECOMMANDATIONS : Points de vigilance ou améliorations possibles.

      Réponds de manière concise en Markdown avec des icônes pour faciliter la lecture.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text;
  } catch (error: any) {
    console.error("Erreur Gemini:", error);
    if (error.message?.includes('xhr error') || error.status === 'UNKNOWN') {
      return "### ⚠️ Erreur de connexion IA\n\nLe service d'analyse rencontre une difficulté technique temporaire. Veuillez réessayer.";
    }
    return `### ⚠️ Analyse indisponible\n\n**Raison :** ${error.message}`;
  }
};
