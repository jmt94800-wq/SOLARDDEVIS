
import { GoogleGenAI } from "@google/genai";
import { ClientProfile } from "./types";

const getAIClient = () => {
  // On récupère la clé depuis GEMINI_API_KEY (priorité au process.env du build ou au window.process injecté)
  const apiKey = (window as any).process?.env?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("Configuration IA : La clé GEMINI_API_KEY est manquante.");
    throw new Error("Clé API non configurée");
  }
  return new GoogleGenAI({ apiKey });
};

export const getEnergyAnalysis = async (profile: ClientProfile) => {
  try {
    const ai = getAIClient();
    const prompt = `
      En tant qu'expert en énergie solaire, analyse le profil de consommation suivant pour un client résidentiel.
      Client: ${profile.name}
      Adresse: ${profile.address}
      Consommation journalière totale estimée: ${profile.totalDailyKWh.toFixed(2)} kWh
      Puissance de crête (tout allumé): ${profile.totalMaxW} W
      
      Détails des appareils:
      ${profile.items.map(i => `- ${i.appareil}: ${i.puissanceHoraireKWh}kWh/h, ${i.dureeHj}h/j, Qte: ${i.quantite}`).join('\n')}

      Fournis une analyse professionnelle courte (en français) incluant:
      1. Une évaluation de la pertinence d'une installation photovoltaïque.
      2. Le dimensionnement conseillé (en kWc).
      3. Un conseil spécifique sur la gestion des appareils.
      4. Une estimation des économies annuelles potentielles.

      Réponds en format Markdown structuré sans mentionner que tu es une IA.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text;
  } catch (error: any) {
    console.error("Erreur Gemini:", error);
    return `### ⚠️ Analyse indisponible\n\nImpossible de générer l'analyse automatique actuellement.\n\n**Raison probable :** ${error.message === 'Clé API non configurée' ? "La clé GEMINI_API_KEY n'a pas été détectée." : "Erreur de communication avec le service Google AI."}`;
  }
};
