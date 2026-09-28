# Survivor PW

Jogo de navegador no estilo *Vampire Survivors* com a temática e as skills do Mago do *Perfect World*. Projeto pessoal.

## Instruções para agentes

Este arquivo é a fonte canônica de instruções para agentes de código neste repositório. O Codex lê `AGENTS.md`; mantenha aqui as regras do projeto. `CLAUDE.md` serve apenas como aviso para quem usar Claude Code e não deve duplicar estas instruções.

Siga também as instruções gerais do ambiente Codex e quaisquer `AGENTS.md` em diretórios pais ou mais específicos. Em conflito entre requisitos do projeto, prevalece `docs/spec.md`; em seguida, `docs/plan.md` e `docs/tasks.md` definem implementação e ordem. Se a spec estiver ambígua, esclareça antes de tomar uma decisão que altere o comportamento do jogo.

## Documentos (SDD) — leia antes de implementar

- `docs/spec.md` — **o quê**: regras do jogo, skills do Mago, Cultivo God/Evil, critérios de aceite.
- `docs/plan.md` — **como**: stack, arquitetura, estrutura de pastas, modelo de dados.
- `docs/tasks.md` — **ordem de execução**: tarefas com dependências e critério de pronto.

Em caso de conflito, a spec manda. Se algo na spec estiver ambíguo ou parecer errado, pergunte antes de decidir.

## Como trabalhar

- Antes de implementar, leia `docs/spec.md`, `docs/plan.md` e `docs/tasks.md`.
- Execute **uma tarefa de `docs/tasks.md` por vez**, na ordem, respeitando as dependências. Se o usuário pedir uma mudança que não corresponda à próxima tarefa, identifique isso e não avance tarefas alheias ao pedido.
- Ao concluir, marque `[x]` na tarefa e confira o critério "Pronto quando".
- Não implemente nada que esteja fora do escopo do MVP (`docs/spec.md` §2) sem pedir.
- Se uma decisão mudar a spec ou o plano, atualize o documento no mesmo commit.
- Ao terminar cada tarefa (testes, lint e build passando), **commit e push automaticamente**, sem pedir confirmação — um commit por tarefa.
- Antes do commit, confira `git status` e inclua somente as alterações desta tarefa; não descarte nem sobrescreva mudanças preexistentes do usuário. Se não for possível fazer push por falta de remoto ou credenciais, informe isso claramente.
- Execute testes, lint e build conforme os comandos abaixo ao concluir uma tarefa de implementação; reporte qualquer falha sem marcar a tarefa como concluída.

## Stack

TypeScript (strict) · Phaser 3 · Vite · Vitest · ESLint + Prettier · deploy na Vercel. Supabase só depois do MVP.

## Comandos

- `npm run dev` — servidor local
- `npm run build` — build de produção em `dist/`
- `npm test` — testes (Vitest)
- `npm run lint` — lint

## Regras de código

- **Todo balanceamento fica em `src/data/`** (dano, espera, HP, spawn, aditivos de cultivo). Nenhum número de balanceamento solto na lógica.
- Lógica de regras (dano, XP, level-up, sorteio, `calculateStats`, cultivo) em funções puras, fora das classes do Phaser, e com testes.
- Aditivos de Cultivo são **modificadores declarados nos dados** (`plan.md` §3.3), não `if` dentro de cada skill.
- Use os pools (`core/Pool.ts`) para inimigos, projéteis, gemas e efeitos; nada de criar/destruir objetos durante a partida.
- Busca de alvos e colisões pela grade espacial (`core/SpatialGrid.ts`).
- Aleatoriedade sempre pelo RNG com semente (`core/rng.ts`).
- Comunicação jogo → HUD pelo `EventBus`.
- **Código em inglês, sempre:** nomes de arquivos, classes, funções, variáveis, campos de tipos e comentários — inclusive termos de domínio (`damage`, `cooldown`, `cultivation`, `mastery`, `stun`, `slow`, `path`, etc.), mesmo quando o `plan.md`/`spec.md` os descrevem em português. Só o texto exibido ao jogador (nomes de skills como "Marca do Fogo", labels de UI, descrições) fica em português, vindo de `src/data/`.
- Textos da interface (o que o jogador vê) em português.
- A arte atual é placeholder até a Fase 6. O projeto pode utilizar assets oficiais do Perfect World, pois é pessoal e sem fins comerciais, conforme decisão do usuário.
