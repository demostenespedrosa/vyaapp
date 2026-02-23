
export const SIZES = {
  P: {
    label: 'Pequeno (P)',
    weight: 'Até 3kg',
    examples: 'Celulares, documentos',
    pricing: { short: 15, medium: 25, long: 45 },
  },
  M: {
    label: 'Médio (M)',
    weight: 'Até 10kg',
    examples: 'Caixas de sapatos, sacolas de roupas',
    pricing: { short: 25, medium: 45, long: 75 },
  },
  G: {
    label: 'Grande (G)',
    weight: 'Até 30kg',
    examples: 'Fardos volumosos',
    pricing: { short: 45, medium: 80, long: 130 },
  },
} as const;

export type SizeKey = keyof typeof SIZES;

export const MODALS = [
  { id: 'car', label: 'Carro', icon: 'Car', description: 'Porta-malas livre' },
  { id: 'moto', label: 'Moto', icon: 'Bike', description: 'Apenas tamanho P, exige baú' },
  { id: 'bus', label: 'Ônibus', icon: 'Bus', description: 'Até 30kg no bagageiro' },
] as const;

export function calculatePrice(size: SizeKey, distance: number): number {
  const p = SIZES[size].pricing;
  if (distance <= 150) return p.short;
  if (distance <= 300) return p.medium;
  return p.long;
}

export const TRAVELER_MODALS = [
  { id: 'car', label: 'Carro', description: 'Ideal para todos os tamanhos' },
  { id: 'moto', label: 'Moto', description: 'Apenas pacotes P e M' },
  { id: 'truck', label: 'Caminhão/Furgão', description: 'Grande capacidade' },
  { id: 'bus', label: 'Ônibus Intermunicipal', description: 'Viagem de linha' },
] as const;

export interface PredefinedRoute {
  id: string;
  origin: string;
  destination: string;
  stops: string[];
  distanceKm: number;
  averageDurationMin: number;
}

export const PREDEFINED_ROUTES: PredefinedRoute[] = [
  {
    id: 'route-1',
    origin: 'Caruaru, PE',
    destination: 'Recife, PE',
    stops: ['Bezerros, PE', 'Gravatá, PE', 'Vitória de Santo Antão, PE', 'Jaboatão, PE'],
    distanceKm: 135,
    averageDurationMin: 120
  },
  {
    id: 'route-2',
    origin: 'Recife, PE',
    destination: 'Caruaru, PE',
    stops: ['Jaboatão, PE', 'Vitória de Santo Antão, PE', 'Gravatá, PE', 'Bezerros, PE'],
    distanceKm: 135,
    averageDurationMin: 125
  },
  {
    id: 'route-3',
    origin: 'São Paulo, SP',
    destination: 'Rio de Janeiro, RJ',
    stops: ['São José dos Campos, SP', 'Taubaté, SP', 'Resende, RJ', 'Volta Redonda, RJ'],
    distanceKm: 435,
    averageDurationMin: 360
  }
];
