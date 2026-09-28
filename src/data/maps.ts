export interface MapCatalogEntry {
  id: string;
  name: string;
  available: boolean;
}

export const mapCatalog: MapCatalogEntry[] = [
  { id: 'wolves-den', name: 'Toca dos Lobos', available: true },
  { id: 'fire-cave', name: 'Caverna do Fogo', available: false },
  {
    id: 'scorpion-serpent-cave',
    name: 'Caverna do Escorpião-Serpente',
    available: false,
  },
];
