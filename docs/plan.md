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
│   │   ├── CultivoScene.ts  # escolha God/Evil no nível 20
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
│   │   ├── CultivoSystem.ts # caminho ativo e aplicação dos modificadores
│   │   ├── XpSystem.ts      # XP e subida de nível
│   │   ├── UpgradeSystem.ts # sorteio das 3 opções
│   │   └── StatsTracker.ts  # dados para a tela final
│   ├── skills/
│   │   ├── Skill.ts         # interface base
│   │   ├── MarcaDoFogo.ts
│   │   ├── FonteRepentina.ts
│   │   ├── ChuvaDePedra.ts
│   │   ├── AsasDaFenix.ts
│   │   ├── TempestadeFlamejante.ts
│   │   ├── TempestadeDeAreia.ts
│   │   └── TerraMovel.ts
│   ├── data/                # TODO o balanceamento fica aqui
│   │   ├── classes.ts       # atributos do Mago
│   │   ├── skills.ts        # valores por nível de cada skill
│   │   ├── passives.ts
│   │   ├── enemies.ts
│   │   └── waves.ts         # curva de spawn
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

`Boot → Menu → Game (+ Hud em paralelo) → LevelUp / Cultivo / Pause (sobrepostas, pausam o Game) → Result → Menu`

`GameScene` roda a simulação. `HudScene` só lê o estado e escuta o `EventBus` (`hp-changed`, `xp-changed`, `level-up`, `cultivo-escolhido`, `enemy-killed`, `skill-leveled`).

### 3.2 Skills orientadas a dados

Cada skill tem uma **definição** (dados) e um **comportamento** (código):

```ts
// data/skills.ts
export const marcaDoFogo: SkillDef = {
  id: 'marca-do-fogo',
  nome: 'Marca do Fogo',
  elemento: 'fogo',
  tipo: 'ataque',
  niveis: [
    { dano: 10, espera: 1.5, projeteis: 1 },
    { dano: 14, espera: 1.5, projeteis: 1 },
    { dano: 16, espera: 1.4, projeteis: 2 },
    { dano: 20, espera: 1.3, projeteis: 2 },
    { dano: 24, espera: 1.2, projeteis: 3 },
  ],
};
```

```ts
// skills/Skill.ts
interface Skill {
  def: SkillDef;
  nivel: number;
  update(dt: number, ctx: SkillContext): void; // controla a recarga e dispara
}
```

O `SkillSystem` percorre as skills equipadas a cada frame. Dano final:

```
danoFinal = danoBase(nível) × (1 + maestriaDoElemento) × (1 − reduçãoDoAlvo)
esperaFinal = esperaBase(nível) × (1 − serenidade)
```

Adicionar uma skill nova = um objeto em `data/skills.ts` + uma classe em `skills/`. Nada mais muda.

### 3.3 Cultivo (God / Evil) como modificadores

Os aditivos não são código dentro de cada skill: são **modificadores declarados nos dados**, e cada skill só consulta o valor final.

```ts
type Caminho = 'god' | 'evil';

type Modificador =
  | { tipo: 'mult_espera'; valor: number }                 // 0.8 = −20%
  | { tipo: 'dano_fixo'; valor: number }
  | { tipo: 'chance_status'; status: 'atordoar' | 'paralisar'; chance: number; duracao: number }
  | { tipo: 'roubo_vida'; chance: number; porcentagem: number }
  | { tipo: 'cura_por_acerto'; chance: number; valor: number; maxPorAtivacao: number }
  | { tipo: 'mult_lentidao'; valor: number }
  | { tipo: 'mult_area'; valor: number }
  | { tipo: 'mult_duracao_efeito'; valor: number }
  | { tipo: 'mult_distancia'; valor: number }
  | { tipo: 'bonus_dano_elemento'; valor: number }
  | { tipo: 'chance_critico'; valor: number }
  | { tipo: 'reducao_dano_recebido'; valor: number }
  | { tipo: 'mult_regeneracao'; valor: number }
  | { tipo: 'mult_defesa'; valor: number }
  | { tipo: 'buff_periodico'; intervalo: number; duracao: number; bonusDano: number };

// dentro de SkillDef / PassiveDef
cultivo: {
  god:  { descricao: string; modificadores: Modificador[] };
  evil: { descricao: string; modificadores: Modificador[] };
};
```

Exemplo:

```ts
// data/skills.ts — Chuva de Pedra
cultivo: {
  god:  { descricao: '−20% de espera', modificadores: [{ tipo: 'mult_espera', valor: 0.8 }] },
  evil: { descricao: '20% de chance de atordoar por 2 s',
          modificadores: [{ tipo: 'chance_status', status: 'atordoar', chance: 0.2, duracao: 2 }] },
},
```

Como funciona:
- `CultivoSystem` guarda o caminho escolhido (ou nenhum) e expõe `modificadoresDe(skillId)`.
- `SkillSystem` e `CombatSystem` calculam os valores finais juntando **nível da skill + passivos + cultivo**, numa função pura `calcularStats(def, nivel, passivos, caminho)`. Ela é testável e é a única fonte da verdade.
- A tela de Cultivo lê `descricao` dos dados para montar as colunas. Nada de texto duplicado no código.
- A escolha dispara `cultivo-escolhido`; as skills trocam a cor do efeito ao ouvir o evento.
- Na fila de level-up (`XpSystem`), o nível 20 insere um item do tipo `cultivo` antes do level-up normal.

Dano final, agora com cultivo:

```
danoBase     = dano(nível) + danoFixoCultivo
multiplicador = (1 + maestria + bonusDanoElementoCultivo) × buffPeriodico
danoFinal    = danoBase × multiplicador × (crítico ? 2 : 1) × (1 − reduçãoDoAlvo)
esperaFinal  = espera(nível) × (1 − serenidade) × multEsperaCultivo
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
  salvarPartida(resultado: RunResult): Promise<void>;
  ranking(limite: number): Promise<RankingEntry[]>;
}
```

No MVP, `LocalScoreService` guarda o melhor resultado no navegador. Depois, `SupabaseScoreService` implementa a mesma interface.

Esboço das tabelas:

```sql
profiles (id uuid pk -> auth.users, apelido text, criado_em timestamptz)
runs (
  id uuid pk, user_id uuid -> profiles, classe text,
  tempo_seg int, nivel int, mortes int, vitoria bool, cultivo text,
  seed bigint, versao_jogo text, criado_em timestamptz
)
```

- RLS: cada usuário insere só as próprias partidas; ranking é leitura pública.
- Insert via **Edge Function** que faz checagens de sanidade (tempo ≤ 600 s, mortes compatíveis com o tempo, versão válida).

### Escalar no futuro

- O cliente é estático e servido pela CDN da Vercel; escala sem mudanças.
- Supabase aguenta ranking e saves com folga; se um dia houver multiplayer, entra um servidor de tempo real separado (ex.: Supabase Realtime ou um serviço dedicado), sem mexer no cliente de jogo solo.
- `versao_jogo` em cada partida permite mudar o balanceamento sem misturar rankings.

## 7. Riscos

| Risco | Mitigação |
|---|---|
| Queda de FPS com muitos inimigos | Pools e grade espacial desde o início (tarefas da fase 1) |
| Balanceamento ruim | Todos os valores em `data/`; modo debug para dar XP e skills |
| Uso de marca e nomes do PW | Projeto pessoal, arte própria; revisar antes de qualquer publicação aberta |
