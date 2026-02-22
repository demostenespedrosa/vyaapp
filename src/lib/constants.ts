
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
