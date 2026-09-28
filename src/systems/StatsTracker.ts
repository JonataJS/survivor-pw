import type { Path, SkillDef } from '../data/types';

export interface SkillDamageResult {
  skillId: string;
  skillName: string;
  damage: number;
}

export interface RunResult {
  victory: boolean;
  survivedSeconds: number;
  level: number;
  cultivationPath?: Path;
  kills: number;
  damageBySkill: SkillDamageResult[];
}

export class StatsTracker {
  private readonly skillDamage = new Map<string, SkillDamageResult>();

  registerSkill(skill: SkillDef): void {
    if (skill.type !== 'attack' || this.skillDamage.has(skill.id)) return;
    this.skillDamage.set(skill.id, { skillId: skill.id, skillName: skill.name, damage: 0 });
  }

  recordDamage(skillId: string | undefined, amount: number): void {
    if (!skillId || amount <= 0) return;
    const result = this.skillDamage.get(skillId);
    if (result) result.damage += amount;
  }

  createRunResult(
    victory: boolean,
    survivedSeconds: number,
    level: number,
    cultivationPath: Path | undefined,
    kills: number,
  ): RunResult {
    return {
      victory,
      survivedSeconds,
      level,
      cultivationPath,
      kills,
      damageBySkill: [...this.skillDamage.values()].map((result) => ({ ...result })),
    };
  }
}
