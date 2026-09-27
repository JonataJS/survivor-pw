export const CONTACT_DAMAGE_INTERVAL_SECONDS = 0.5;

export function calculatePhysicalDamage(rawDamage: number, defense: number): number {
  return Math.max(0, rawDamage - defense);
}
