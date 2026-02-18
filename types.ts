
export interface ProspectEntry {
  id: string;
  client: string;
  lieu: string;
  adresse: string;
  date: string;
  agent: string;
  appareil: string;
  puissanceHoraireKWh: number;
  puissanceMaxW: number;
  dureeHj: number;
  quantite: number;
  unitPrice?: number; // Prix d'achat ou base
}

export interface ClientProfile {
  name: string;
  address: string;
  siteName: string;
  visitDate: string;
  items: ProspectEntry[];
  totalDailyKWh: number;
  totalMaxW: number;
}

export interface QuoteConfig {
  marginPercent: number;
  discountPercent: number;
  materialTaxPercent: number;
  installCost: number;
  installTaxPercent: number;
}
