# Tarefas — Survivor PW (MVP)

> Documento 3 de 3 do SDD. Executar em ordem. Cada tarefa é pequena, tem dependências e um critério de pronto.
> Referências: `spec.md` (o quê) e `plan.md` (como).

Legenda: `[ ]` a fazer · `[x]` feito · **Dep.** = tarefas que precisam estar prontas antes.

---

## Fase 0 — Setup

- [x] **T001 — Criar o projeto**
  Vite + TypeScript + Phaser 3. ESLint, Prettier e Vitest configurados. Pastas conforme `plan.md` §2.
  **Pronto quando:** `npm run dev` abre uma tela preta do Phaser; `npm test` roda.

- [x] **T002 — Deploy inicial na Vercel** · Dep.: T001
  Repositório no GitHub conectado à Vercel.
  **Pronto quando:** a URL pública abre o jogo; um push na `main` atualiza o site.

- [x] **T003 — Cenas vazias e navegação** · Dep.: T001
  Boot, Menu, Game, Hud, Pause, LevelUp, Cultivo e Result, com troca entre elas.
  **Pronto quando:** dá para ir do Menu ao Game e voltar pelo Result usando botões de teste.

- [x] **T004 — Texturas placeholder** · Dep.: T003
  Gerar na BootScene formas simples: mago (círculo roxo), inimigos (quadrados por tipo), projéteis e gemas, com cores por elemento.
  **Pronto quando:** todas as texturas usadas no MVP existem sem arquivos externos.

## Fase 1 — Núcleo da partida

- [x] **T010 — Dados do jogo** · Dep.: T001
  Criar `data/classes.ts`, `skills.ts`, `passives.ts`, `enemies.ts` e `waves.ts` com os valores de `spec.md` §5–§6, e os tipos `SkillDef`, `EnemyDef`, `Modificador` etc. Cada skill e passivo já inclui o bloco `cultivo` (God e Evil) de `spec.md` §5.4.
  **Pronto quando:** os arquivos compilam e cobrem todas as skills, passivos, aditivos de cultivo e inimigos do MVP.

- [x] **T011 — Jogador e movimento** · Dep.: T004, T010
  Mago com HP e velocidade vindos dos dados; movimento por WASD/setas; câmera seguindo.
  **Pronto quando:** o mago anda em 8 direções numa área maior que a tela.

- [x] **T012 — Pool de objetos e grade espacial** · Dep.: T001
  `core/Pool.ts` e `core/SpatialGrid.ts`, com testes (inserir, mover, consultar vizinhos, mais próximo).
  **Pronto quando:** os testes passam.

- [x] **T013 — Inimigos e spawn** · Dep.: T011, T012
  `Enemy` com os 3 tipos; `SpawnSystem` lendo `waves.ts`, surgindo fora da tela e perseguindo o jogador.
  **Pronto quando:** as ondas crescem com o tempo e os tipos Rápido (1:30) e Tanque (3:00) aparecem na hora certa.

- [x] **T014 — Dano de contato e morte** · Dep.: T013
  Inimigo encosta → dano no jogador (intervalo de 0,5 s, com defesa). HP zero → Result com derrota.
  **Pronto quando:** morrer leva à tela final.

- [x] **T015 — Cronômetro e vitória** · Dep.: T011
  Cronômetro de partida; aos 10:00 → Result com vitória.
  **Pronto quando:** com um modo de tempo acelerado (debug), a vitória é disparada.

- [x] **T016 — Teste de estresse** · Dep.: T013
  Modo debug (F1) mostrando FPS e total de entidades; comando para gerar 300 inimigos.
  **Pronto quando:** 300 inimigos rodam perto de 60 FPS. Se não, otimizar antes de seguir.

## Fase 2 — Combate e skills

- [x] **T020 — Sistema de combate** · Dep.: T010
  `CombatSystem` com dano por elemento, maestrias, defesa, **crítico** e status (lentidão, redução de dano, **atordoar**, **paralisar**), além de **roubo de vida** e cura por acerto. Função pura `calcularStats(def, nivel, passivos, caminho)`. Lógica pura, com testes.
  **Pronto quando:** os testes cobrem as fórmulas de `plan.md` §3.2 e §3.3.

- [x] **T021 — Base de skills** · Dep.: T020, T012
  Interface `Skill`, `SkillSystem` (recarga, disparo, Serenidade) e busca de alvo pela grade.
  **Pronto quando:** uma skill de teste dispara no ritmo certo.

- [x] **T022 — Marca do Fogo** · Dep.: T021
  Projétil no inimigo mais próximo; +projéteis nos níveis 3 e 5. Skill inicial.
  **Pronto quando:** o mago mata inimigos comuns sozinho desde o começo.

- [x] **T023 — Gemas de XP e coleta** · Dep.: T014
  Gema ao matar; atração dentro do raio de coleta; fusão acima de ~200 gemas.
  **Pronto quando:** coletar gemas enche a barra de XP.

- [x] **T024 — Fonte Repentina** · Dep.: T021 — coluna de água que sobe do chão sob o inimigo (dano instantâneo, sem projétil), com lentidão. Visual: círculo azul no chão que cresce para cima em forma de jato vertical e se desfaz.
- [x] **T025 — Chuva de Pedra** · Dep.: T021 — pedra que cai do céu como meteoro sobre um inimigo aleatório visível (sombra no chão antes do impacto).
- [x] **T026 — Asas da Fênix** · Dep.: T021 — fênix de fogo em linha reta na direção do movimento, atravessa e empurra todos os inimigos no caminho.
- [x] **T027 — Tempestade Flamejante** · Dep.: T021 — área em pulsos ao redor do jogador.
- [x] **T028 — Tempestade de Areia** · Dep.: T021 — rajada de areia do mago até o inimigo mais forte por perto; dano em alvo único e −50% no dano dele por 3 s.
  **Pronto quando (T024–T028):** cada skill funciona nos níveis 1 a 5 com os valores dos dados.

- [x] **T029 — Terra Móvel (dash)** · Dep.: T011, T021
  Espaço/botão; dash na direção do movimento; intocável durante o dash; recarga mostrada.
  **Pronto quando:** o dash atravessa inimigos sem receber dano.

- [x] **T030 — Passivos** · Dep.: T020
  3 maestrias, Escudo de Terra, Escudo de Fogo e Serenidade.
  **Pronto quando:** cada passivo altera o valor esperado (conferido no modo debug).

## Fase 3 — Progressão

- [x] **T040 — XP e subida de nível** · Dep.: T023
  Curva `5 + nível × 10`; suporte a vários níveis de uma vez (fila de level-ups). Com testes.
  **Pronto quando:** os testes passam e subir de nível dispara o evento.

- [x] **T041 — Sorteio de upgrades** · Dep.: T040, T030
  3 opções, respeitando slots (6+6), nível máximo 5 e fallback de +20 HP. Com testes e RNG com semente.
  **Pronto quando:** os testes cobrem todos os casos de `spec.md` §7.

- [x] **T042 — Tela de level-up** · Dep.: T041
  Pausa o jogo; 3 cartas com nome, cor do elemento, nível atual → próximo e descrição; teclas 1/2/3, clique ou toque.
  **Pronto quando:** escolher uma carta aplica o upgrade e retoma a partida.

- [x] **T043 — Sistema de Cultivo** · Dep.: T040, T020
  `CultivoSystem` guardando o caminho; `XpSystem` insere o Cultivo na fila no nível 20 (antes do level-up normal). Testes: nível 20 sozinho, subir do 18 ao 22 de uma vez, e skill pega depois da escolha já recebendo o aditivo.
  **Pronto quando:** os testes passam.

- [x] **T044 — Tela de Cultivo** · Dep.: T043, T042
  Duas colunas (God dourado/branco, Evil vermelho/roxo) listando os aditivos das skills e passivos atuais, lidos de `descricao` nos dados; confirmar com clique, toque ou teclas 1/2. Ícone do caminho no HUD depois da escolha.
  **Pronto quando:** a escolha pausa o jogo, aplica o caminho e segue para o level-up normal do nível 20.

- [x] **T045 — Aditivos em cada skill e passivo** · Dep.: T043, T022–T030
  Garantir que as 6 skills de ataque, a Terra Móvel e os 6 passivos respondem a todos os modificadores da tabela de `spec.md` §5.4, incluindo o buff periódico da Serenidade God.
  **Pronto quando:** no modo debug (comando para forçar God ou Evil), cada aditivo tem efeito visível ou mensurável.

- [x] **T046 — Visual do caminho** · Dep.: T044
  Efeitos das skills e aura do mago trocam de cor conforme o caminho; números de crítico maiores e em outra cor; ícone de atordoado/paralisado no inimigo.
  **Pronto quando:** dá para identificar o caminho e os status só olhando a tela.

## Fase 4 — Interface

- [x] **T050 — HUD** · Dep.: T040, T029
  HP, XP e nível, cronômetro, mortes, ícones de skills com nível e recarga do dash.
  **Pronto quando:** tudo atualiza em tempo real via EventBus.

- [ ] **T051 — Menu e pausa** · Dep.: T003
  Menu com título, "Jogar" e controles; pausa com Esc/P e botão "Continuar / Sair".
  **Pronto quando:** pausar congela tudo, inclusive recargas e spawn.

- [ ] **T052 — Tela final** · Dep.: T015, T014
  Vitória/derrota, tempo, nível, caminho de cultivo, mortes e dano por skill (`StatsTracker`); "Jogar de novo".
  **Pronto quando:** os números batem com a partida jogada.

- [ ] **T053 — Recorde local** · Dep.: T052
  `ScoreService` + `LocalScoreService` salvando o melhor resultado no navegador; exibido no menu.
  **Pronto quando:** o recorde continua lá depois de recarregar a página.

- [ ] **T054 — Controles de toque** · Dep.: T011, T029
  Joystick virtual e botão de dash, só em telas de toque; escala `FIT`.
  **Pronto quando:** dá para jogar uma partida completa no celular.

## Fase 5 — Fechamento do MVP

- [ ] **T060 — Balanceamento** · Dep.: todas as anteriores
  Jogar várias partidas e ajustar `data/`. Metas: vencer é possível, mas não garantido; o nível 20 (Cultivo) cai por volta do minuto 5; God e Evil são opções igualmente viáveis; o mago não fica fraco demais contra hordas por ter poucas skills de área.
- [ ] **T061 — Feedback visual** · Dep.: T028
  Números de dano, piscar ao receber dano, partículas simples por elemento.
- [ ] **T062 — Verificação dos critérios de aceite** · Dep.: T060, T061
  Passar pelo checklist de `spec.md` §9 em Chrome, Firefox, Safari e um celular.
  **Pronto quando:** os 7 critérios passam. MVP entregue.

---

## Pós-MVP (não detalhar ainda)

- **T100** Supabase: projeto, tabelas `profiles` e `runs`, RLS.
- **T101** Login anônimo.
- **T102** `SupabaseScoreService` + Edge Function de validação.
- **T103** Tela de ranking.
- **T110** Sutra do Coração e Orvalho da Manhã (ativas).
- **T111** Chefes e baús.
- **T112** Evoluções: Mar de Chamas, Ira do Dragão de Água, Peso da Montanha.
- **T120** Meta-progressão (ouro e refino).
- **T130** Próxima classe.
