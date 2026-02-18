
import React, { useState, useRef, useEffect } from 'react';
import { ProspectEntry, ClientProfile, QuoteConfig } from './types';
import { parseCSV, groupByClient } from './utils';
import { Dashboard } from './components/Dashboard';
import { QuoteEditor } from './components/QuoteEditor';
import { QuoteGenerator } from './components/QuoteGenerator';

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(null);
  const [quoteConfig, setQuoteConfig] = useState<QuoteConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeyMissing, setIsKeyMissing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Vérification de la clé API standardisée
    const apiKey = process.env.API_KEY;
    setIsKeyMissing(!apiKey);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError("Le fichier semble vide ou mal formaté.");
          return;
        }
        setProfiles(groupByClient(parsed));
        setError(null);
      } catch (err) {
        setError("Erreur lors de la lecture du fichier CSV.");
      }
    };
    reader.readAsText(file);
  };

  const handleProfileSelect = (profile: ClientProfile) => {
    setSelectedProfile(profile);
    setIsEditing(true);
  };

  const handleSaveQuote = (updatedProfile: ClientProfile, config: QuoteConfig) => {
    setSelectedProfile(updatedProfile);
    setQuoteConfig(config);
    setIsEditing(false);
  };

  if (selectedProfile && isEditing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <QuoteEditor 
          profile={selectedProfile} 
          onSave={handleSaveQuote} 
          onCancel={() => { setSelectedProfile(null); setIsEditing(false); }} 
        />
      </div>
    );
  }

  if (selectedProfile && quoteConfig) {
    return (
      <div className="min-h-screen bg-slate-50">
        <QuoteGenerator 
          profile={selectedProfile} 
          config={quoteConfig}
          onBack={() => setIsEditing(true)} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {isKeyMissing && (
        <div className="bg-amber-500 text-white px-4 py-2 text-center text-xs font-bold no-print">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
          API_KEY manquante. L'analyse IA est désactivée.
        </div>
      )}
      
      <nav className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <i className="fa-solid fa-sun text-white"></i>
          </div>
          <h1 className="text-xl font-black text-slate-900">SolarDevis <span className="text-blue-600">Pro</span></h1>
        </div>
        {profiles.length > 0 && (
          <button 
            onClick={() => { setProfiles([]); setSelectedProfile(null); }}
            className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-widest"
          >
            Réinitialiser
          </button>
        )}
      </nav>

      <main className="flex-1 container mx-auto px-6 py-12">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium">{error}</div>}

        {profiles.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-20">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <i className="fa-solid fa-file-csv text-3xl"></i>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Prêt pour votre prochain devis ?</h2>
            <p className="text-slate-500 text-lg mb-10">Importez les données de l'audit pour commencer la configuration commerciale.</p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
            >
              Importer un fichier CSV
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Projets Détectés</h2>
                <p className="text-slate-500 font-medium">Sélectionnez un client pour configurer le prix.</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 font-bold flex items-center gap-2 hover:underline"
              >
                <i className="fa-solid fa-plus"></i> Nouveau fichier
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              </button>
            </div>
            <Dashboard profiles={profiles} onSelect={handleProfileSelect} />
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        &copy; 2024 SolarDevis Pro • Outil interne réservé aux agents certifiés
      </footer>
    </div>
  );
};

export default App;
