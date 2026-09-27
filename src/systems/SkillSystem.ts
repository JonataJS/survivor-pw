import type { Skill, SkillContext } from '../skills/Skill';

export class SkillSystem {
  private readonly skills: Skill[] = [];

  add(skill: Skill): void {
    this.skills.push(skill);
  }

  remove(skill: Skill): void {
    const index = this.skills.indexOf(skill);
    if (index !== -1) this.skills.splice(index, 1);
  }

  update(dt: number, ctx: SkillContext): void {
    for (const skill of this.skills) {
      skill.update(dt, ctx);
    }
  }
}
