export interface ClassCatalogEntry {
  id: string;
  name: string;
  available: boolean;
}

export const classCatalog: ClassCatalogEntry[] = [
  { id: 'mage', name: 'Mago', available: true },
  { id: 'warrior', name: 'Guerreiro', available: false },
  { id: 'barbarian', name: 'Bárbaro', available: false },
  { id: 'venomancer', name: 'Feiticeira', available: false },
  { id: 'archer', name: 'Arqueiro', available: false },
  { id: 'cleric', name: 'Sacerdote', available: false },
];
