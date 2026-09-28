// XP needed to advance from each level through level 20; early upgrades are
// frequent, then each subsequent level requires progressively more XP.
export const XP_REQUIRED_BY_LEVEL = [
  5, 8, 12, 16, 22, 30, 40, 50, 60, 75, 90, 110, 130, 160, 180, 210, 360, 450, 540,
] as const;

// Beyond the Cultivation level, the next-level requirement keeps increasing
// without needing more entries in the balance table.
export const XP_REQUIREMENT_GROWTH_AFTER_CULTIVATION = 40;
