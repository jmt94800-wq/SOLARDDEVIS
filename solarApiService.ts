
export interface SolarData {
  hsp: number;
  maxPanels?: number;
  maxArrayArea?: number;
  maxArrayKwp?: number;
}

export const fetchSolarData = async (lat: number, lng: number): Promise<SolarData | null> => {
  const apiKey = process.env.GOOGLE_SOLAR_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_SOLAR_API_KEY is missing");
    return null;
  }

  try {
    const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Solar API Error:", error);
      return null;
    }

    const data = await response.json();
    
    // The Solar API returns 'solarPotential'. 
    // We can derive HSP from 'maxSunshineHoursPerYear' / 365
    const solarPotential = data.solarPotential;
    if (!solarPotential) return null;

    const hsp = solarPotential.maxSunshineHoursPerYear / 365;
    
    return {
      hsp: parseFloat(hsp.toFixed(2)),
      maxPanels: solarPotential.maxArrayPanels,
      maxArrayArea: solarPotential.maxArrayAreaMeters2,
      maxArrayKwp: (solarPotential.maxArrayPanels * 400) / 1000, // Estimation base 400W
    };
  } catch (error) {
    console.error("Failed to fetch solar data:", error);
    return null;
  }
};

/**
 * Default HSP values for Haiti regions if API fails
 */
export const getHaitiDefaultHSP = (region?: string): number => {
  // Average HSP in Haiti is around 5.0 - 5.5
  const defaults: Record<string, number> = {
    "Port-au-Prince": 5.4,
    "Cap-Haïtien": 5.2,
    "Les Cayes": 5.5,
    "Jacmel": 5.3,
    "Gonaïves": 5.6,
  };
  
  return region ? (defaults[region] || 5.2) : 5.2;
};
