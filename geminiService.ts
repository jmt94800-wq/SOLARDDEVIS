
import { GoogleGenAI } from "@google/genai";
import { ClientProfile } from "./types";

export const getEnergyAnalysis = async (profile: ClientProfile) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      En tant qu'expert en énergie solaire pour le marché d'Haïti (HSP moyen 5.2), analyse le profil de consommation suivant.
      Client: ${profile.name}
      Adresse: ${profile.address}
      Consommation journalière: ${profile.totalDailyKWh.toFixed(2)} kWh/j
      Puissance de crête (charges critiques): ${profile.totalMaxW} W
      
      Détails des appareils:
      ${profile.items.map(i => `- ${i.appareil}: ${i.puissanceHoraireKWh}kWh/h, ${i.dureeHj}h/j, Qte: ${i.quantite} (Inclus crête: ${i.inclusPuisCrete ? 'OUI' : 'NON'})`).join('\n')}

      Fournis une analyse professionnelle courte (en français) incluant:
      1. Évaluation du potentiel solaire local.
      2. Dimensionnement conseillé et type d'onduleur recommandé pour ${profile.totalMaxW}W de crête.
      3. Conseils d'économie d'énergie.
      4. Estimation de rentabilité annuelle (en dollars US $).

      Réponds en format Markdown structuré.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text;
  } catch (error: any) {
    console.error("Erreur Gemini:", error);
    return `### ⚠️ Analyse indisponible\n\nImpossible de générer l'analyse automatique actuellement.\n\n**Raison :** ${error.message}`;
  }
};
