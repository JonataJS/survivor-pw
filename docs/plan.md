# Plano técnico — Survivor PW

> Documento 2 de 3 do SDD. Define **como** construir o que está em `spec.md`.

## 1. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| Linguagem | **TypeScript** | Tipos ajudam a manter skills e dados consistentes |
| Engine | **Phaser 3** | Motor 2D maduro para web, com física arcade, cenas, input e suporte a toque |
| Build | **Vite** | Rápido, gera site estático, deploy direto na Vercel |
| Hospedagem | **Vercel** | Deploy automático a cada push, com preview por branch |
| Backend (pós-MVP) | **Supabase** | Postgres, Auth, RLS e Edge Functions |
| Testes | **Vitest** | Testa a lógica pura (dano, XP, level-up, spawn) sem abrir o jogo |
| Qualidade | ESLint + Prettier | Padrão de código |

O MVP é um **site estático**: nenhuma chamada ao backend. O cliente do Supabase entra só na fase pós-MVP, atrás de uma interface própria (seção 6).

## 2. Estrutura de pastas

```
survivor-pw/
├── docs/
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── public/                  # assets estáticos (placeholder)
├── src/
│   ├── main.ts              # cria o Phaser.Game e registra as cenas
│   ├── config.ts            # resolução, FPS, flags de debug
│   ├── scenes/
│   │   ├── BootScene.ts     # carrega assets e gera texturas placeholder
│   │   ├── MenuScene.ts
│   │   ├── GameScene.ts     # partida
│   │   ├── HudScene.ts      # UI sobreposta à partida
│   │   ├── LevelUpScene.ts
│   │   ├── CultivationScene.ts  # escolha God/Evil no nível 20
│   │   ├── PauseScene.ts
│   │   └── ResultScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Enemy.ts
│   │   ├── Projectile.ts
│   │   ├── AreaEffect.ts    # tempestade flamejante, coluna da fonte, impacto do meteoro
│   │   └── XpGem.ts
│   ├── systems/
│   │   ├── SkillSystem.ts   # recargas e disparo das skills
│   │   ├── SpawnSystem.ts   # ondas por tempo
│   │   ├── CombatSystem.ts  # dano, crítico, defesa, status (lentidão, atordoar, paralisar, redução de dano)
│   │   ├── DamageNumberSystem.ts # números flutuantes de dano
│   │   ├── ElementHitEffectSystem.ts # partículas de impacto por elemento
│   │   ├── CultivationSystem.ts # caminho ativo e aplicação dos modificadores
│   │   ├── XpSystem.ts      # XP e subida de nível
│   │   ├── UpgradeSystem.ts # sorteio das 3 opções
│   │   └── StatsTracker.ts  # dados para a tela final
│   ├── skills/
│   │   ├── Skill.ts         # interface base
│   │   ├── FireMark.ts          # Marca do Fogo
│   │   ├── SuddenSpring.ts      # Fonte Repentina
│   │   ├── StoneRain.ts         # Chuva de Pedra
│   │   ├── PhoenixWings.ts      # Asas da Fênix
│   │   ├── FlamingStorm.ts      # Tempestade Flamejante
│   │   ├── SandStorm.ts         # Tempestade de Areia
│   │   └── MovingEarth.ts       # Terra Móvel
│   ├── data/                # TODO o balanceamento fica aqui
│   │   ├── classes.ts       # atributos do Mago
│   │   ├── skills.ts        # valores por nível de cada skill
│   │   ├── passives.ts
│   │   ├── enemies.ts
│   │   └── waves.ts         # curva de spawn
│   │   ├── progression.ts   # curva de XP por nível
│   ├── core/
│   │   ├── Pool.ts          # reaproveitamento de objetos
│   │   ├── SpatialGrid.ts   # busca de vizinhos/alvos
│   │   ├── EventBus.ts      # eventos entre jogo e HUD
│   │   └── rng.ts           # aleatório com semente
│   ├── services/            # fronteira com o backend
│   │   ├── ScoreService.ts  # interface
│   │   └── LocalScoreService.ts  # implementação do MVP (localStorage)
│   └── ui/                  # componentes: barras, cartas, joystick
└── tests/
```

## 3. Arquitetura do jogo

### 3.1 Cenas

`Boot → Menu → Game (+ Hud em paralelo) → LevelUp / Cultivation / Pause (sobrepostas, pausam o Game) → Result → Menu`

`GameScene` roda a simulação. `HudScene` só lê o estado e escuta o `EventBus` (`hp-changed`, `xp-changed`, `level-up`, `cultivation-required`, `cultivation-chosen`, `enemy-killed`, `skill-leveled`).

`cultivation-required` é disparado pelo `XpSystem` ao alcançar o nível 20, inserido na fila antes do `level-up` desse mesmo nível (spec.md §5.4, T043).

### 3.2 Skills orientadas a dados

Cada skill tem uma **definição** (dados) e um **comportamento** (código):

```ts
// data/skills.ts
export const fireMark: SkillDef = {
  id: 'fire-mark',
  name: 'Marca do Fogo',
  element: 'fire',
  type: 'attack',
  levels: [
    { damage: 10, cooldown: 1.5, projectiles: 1 },
    { damage: 14, cooldown: 1.5, projectiles: 1 },
    { damage: 16, cooldown: 1.4, projectiles: 2 },
    { damage: 20, cooldown: 1.3, projectiles: 2 },
    { damage: 24, cooldown: 1.2, projectiles: 3 },
  ],
};
```

```ts
// skills/Skill.ts
interface Skill {
  def: SkillDef;
  level: number;
  update(dt: number, ctx: SkillContext): void; // controla a recarga e dispara
}
```

O `SkillSystem` percorre as skills equipadas a cada frame. Dano final:

```
finalDamage = baseDamage(level) × (1 + elementMastery) × (1 − targetReduction)
finalCooldown = baseCooldown(level) × (1 − serenity)
```

Adicionar uma skill nova = um objeto em `data/skills.ts` + uma classe em `skills/`. Nada mais muda.

### 3.3 Cultivo (God / Evil) como modificadores

Os aditivos não são código dentro de cada skill: são **modificadores declarados nos dados**, e cada skill só consulta o valor final.

```ts
type Path = 'god' | 'evil';

type Modifier =
  | { type: 'cooldown_mult'; value: number }                 // 0.8 = −20%
  | { type: 'flat_cooldown'; value: number }                 // segundos, negativo = redução
  | { type: 'flat_damage'; value: number }
  | { type: 'status_chance'; status: 'stun' | 'paralyze'; chance: number; duration: number }
  | { type: 'lifesteal'; chance: number; percentage: number }
  | { type: 'heal_on_hit'; chance: number; value: number; maxPerActivation: number }
  | { type: 'slow_mult'; value: number }
  | { type: 'area_mult'; value: number }
  | { type: 'effect_duration_mult'; value: number }
  | { type: 'range_mult'; value: number }
  | { type: 'element_damage_bonus'; value: number }
  | { type: 'crit_chance'; value: number }
  | { type: 'damage_taken_reduction'; value: number }
  | { type: 'regen_mult'; value: number }
  | { type: 'defense_mult'; value: number }
  | { type: 'periodic_buff'; interval: number; duration: number; damageBonus: number };

// dentro de SkillDef / PassiveDef
cultivation: {
  god:  { description: string; modifiers: Modifier[] };
  evil: { description: string; modifiers: Modifier[] };
};
```

Exemplo:

```ts
// data/skills.ts — Chuva de Pedra
cultivation: {
  god:  { description: '−20% de espera', modifiers: [{ type: 'cooldown_mult', value: 0.8 }] },
  evil: { description: '20% de chance de atordoar por 2 s',
          modifiers: [{ type: 'status_chance', status: 'stun', chance: 0.2, duration: 2 }] },
},
```

Como funciona:
- `CultivationSystem` guarda o caminho escolhido (ou nenhum) e expõe `modifiersFor(skillId)`.
- `SkillSystem` e `CombatSystem` calculam os valores finais juntando **nível da skill + passivos + cultivo**, numa função pura `calculateStats(def, level, passives, path)`. Ela é testável e é a única fonte da verdade.
- A tela de Cultivo lê `description` dos dados para montar as colunas. Nada de texto duplicado no código.
- A escolha dispara `cultivation-chosen`; as skills trocam a cor do efeito ao ouvir o evento.
- Na fila de level-up (`XpSystem`), o nível 20 insere um item do tipo `cultivation` antes do level-up normal.

Dano final, agora com cultivo:

```
baseDamage    = damage(level) + cultivationFlatDamage
multiplier    = (1 + mastery + cultivationElementDamageBonus) × periodicBuff
finalDamage   = baseDamage × multiplier × (crit ? 2 : 1) × (1 − targetReduction)
finalCooldown = cooldown(level) × (1 − serenity) × cultivationCooldownMult
```

### 3.4 Desempenho

- **Pools** para inimigos, projéteis, gemas e efeitos: nada é criado ou destruído durante a partida.
- **SpatialGrid** (células de ~64 px) para achar o inimigo mais próximo e checar colisões, em vez de comparar todos com todos.
- Física arcade do Phaser só para o que precisa; áreas usam checagem de distância pela grade.
- Gemas próximas se fundem numa só quando passarem de ~200 na tela.
- Modo debug (tecla F1) mostra FPS, total de entidades e as células da grade.

### 3.5 Aleatoriedade

Um RNG com semente (`rng.ts`) para spawn, sorteio de upgrades e as chances do cultivo (crítico, atordoar, roubo de vida). Isso facilita testes e, no futuro, permite o servidor reproduzir e validar uma partida.

### 3.6 Celular

- `Phaser.Scale.FIT` com resolução base 1280×720.
- Joystick virtual e botão de dash visíveis só em telas de toque.

## 4. Testes

Lógica pura fica fora das classes do Phaser para ser testada com Vitest:

- cálculo de dano com maestria e redução;
- curva de XP e subida de nível (inclusive vários níveis de uma vez);
- regras do sorteio de upgrades (slots cheios, nível máximo, fallback de HP);
- `calcularStats` com e sem cultivo, para cada skill e passivo (God e Evil);
- fila de level-up inserindo o Cultivo no nível 20, inclusive ao subir vários níveis de uma vez;
- curva de spawn por minuto.
- curva de XP acelerada no começo e progressiva até o nível 20.

Teste manual por checklist nos critérios de aceite de `spec.md`.

## 5. Deploy

- Repositório no GitHub conectado à Vercel.
- Build: `npm run build` → pasta `dist/`.
- Cada PR gera uma URL de preview; a branch `main` vai para produção.
- Variáveis de ambiente do Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) só na fase pós-MVP.

## 6. Preparação para o Supabase (pós-MVP)

O jogo depende só da interface `ScoreService`:

```ts
interface ScoreService {
  saveRun(result: RunResult): Promise<void>;
  getBestRun(): Promise<RunResult | null>;
}
```

No MVP, `LocalScoreService` guarda no navegador o resultado com maior tempo sobrevivido (mortes desempata) e o expõe para o menu. O ranking remoto fica para a fase pós-MVP; nessa fase, a interface pode ser ampliada com a consulta de ranking e `SupabaseScoreService` implementará o contrato atualizado.

Esboço das tabelas:

```sql
profiles (id uuid pk -> auth.users, nickname text, created_at timestamptz)
runs (
  id uuid pk, user_id uuid -> profiles, class text,
  time_seconds int, level int, kills int, victory bool, cultivation_path text,
  seed bigint, game_version text, created_at timestamptz
)
```

- RLS: cada usuário insere só as próprias partidas; ranking é leitura pública.
- Insert via **Edge Function** que faz checagens de sanidade (tempo ≤ 1500 s, mortes compatíveis com o tempo, versão válida).

### Escalar no futuro

- O cliente é estático e servido pela CDN da Vercel; escala sem mudanças.
- Supabase aguenta ranking e saves com folga; se um dia houver multiplayer, entra um servidor de tempo real separado (ex.: Supabase Realtime ou um serviço dedicado), sem mexer no cliente de jogo solo.
- `game_version` em cada partida permite mudar o balanceamento sem misturar rankings.

## 7. Riscos

| Risco | Mitigação |
|---|---|
| Queda de FPS com muitos inimigos | Pools e grade espacial desde o início (tarefas da fase 1) |
| Balanceamento ruim | Todos os valores em `data/`; modo debug para dar XP e skills |
| Uso de marca e nomes do PW | Projeto pessoal, arte própria; revisar antes de qualquer publicação aberta |
