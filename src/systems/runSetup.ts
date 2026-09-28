import { classCatalog } from '../data/classCatalog';
import { mapCatalog } from '../data/maps';

export interface RunSetup {
  classId: string;
  mapId: string;
}

export const DEFAULT_RUN_SETUP: Readonly<RunSetup> = {
  classId: 'mage',
  mapId: 'wolves-den',
};

export function validateRunSetup(setup: RunSetup): RunSetup | null {
  const selectedClass = classCatalog.find((entry) => entry.id === setup.classId);
  const selectedMap = mapCatalog.find((entry) => entry.id === setup.mapId);

  if (!selectedClass?.available || !selectedMap?.available) return null;
  return { classId: selectedClass.id, mapId: selectedMap.id };
}

export function resolveRunSetup(setup?: RunSetup): RunSetup | null {
  return validateRunSetup(setup ?? DEFAULT_RUN_SETUP);
}
