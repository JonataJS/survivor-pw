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
  Cronômetro de partida; aos 25:00 → Result com vitória.
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
  Projétil no inimigo visível mais próximo; +projéteis nos níveis 3 e 5. Skill inicial.
  **Pronto quando:** o mago mata inimigos comuns sozinho desde o começo.

- [x] **T023 — Gemas de XP e coleta** · Dep.: T014
  Gema ao matar; atração dentro do raio de coleta; fusão acima de ~200 gemas.
  **Pronto quando:** coletar gemas enche a barra de XP.

- [x] **T024 — Fonte Repentina** · Dep.: T021 — coluna de água que sobe do chão sob o inimigo visível mais próximo (dano instantâneo, sem projétil), com lentidão. Visual: círculo azul no chão que cresce para cima em forma de jato vertical e se desfaz.
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

- [x] **T051 — Menu e pausa** · Dep.: T003
  Menu com título, "Jogar" e controles; pausa com Esc/P e botão "Continuar / Sair".
  **Pronto quando:** pausar congela tudo, inclusive recargas e spawn.

- [x] **T052 — Tela final** · Dep.: T015, T014
  Vitória/derrota, tempo, nível, caminho de cultivo, mortes e dano por skill (`StatsTracker`); "Jogar de novo".
  **Pronto quando:** os números batem com a partida jogada.

- [x] **T053 — Recorde local** · Dep.: T052
  `ScoreService` + `LocalScoreService` salvando o melhor resultado no navegador (maior tempo; mortes como desempate); exibido no menu.
  **Pronto quando:** o recorde continua lá depois de recarregar a página.

- [x] **T054 — Controles de toque** · Dep.: T011, T029
  Joystick virtual e botão de dash, só em telas de toque; escala `FIT`.
  **Pronto quando:** dá para jogar uma partida completa no celular.

## Fase 5 — Fechamento do MVP

- [x] **T060 — Balanceamento** · Dep.: todas as anteriores
  Ajustar `data/` para partidas de 25 minutos. Metas: níveis iniciais chegam rápido e o nível 20 (Cultivo) cai por volta do minuto 20; a dificuldade cresce até o fim. A curva foi verificada por estimativa automatizada de XP e testes; God e Evil mantêm seus efeitos ajustados nos dados.
- [x] **T061 — Feedback visual** · Dep.: T028
  Números flutuantes a cada acerto, flash vermelho ao receber dano e partículas na cor do elemento. Efeitos de partículas e textos reaproveitados.
- [x] **T062 — Verificação dos critérios de aceite** · Dep.: T060, T061
  Passar pelo checklist de `spec.md` §9 em Chrome, Firefox, Safari e um celular.
  **Pronto quando:** os 7 critérios passam. Checklist validado manualmente; MVP entregue.

---

## Fase 6 — Seleção de classe e mapa no menu

Objetivo: apresentar as classes e os mapas no menu, permitir iniciar somente com uma combinação implementada e manter o setup escolhido durante a partida e sua repetição.

- [ ] **T063 — Catálogos de seleção** · Dep.: T062
  Criar definições de catálogo para as classes Mago (`mage`), Guerreiro (`warrior`), Bárbaro (`barbarian`), Feiticeira (`venomancer`), Arqueiro (`archer`) e Sacerdote (`cleric`), e para os mapas Toca dos Lobos (`wolves-den`), Caverna do Fogo (`fire-cave`) e Caverna do Escorpião-Serpente (`scorpion-serpent-cave`). Somente Mago e Toca dos Lobos ficam disponíveis. Manter os atributos jogáveis separados dos metadados de apresentação das classes bloqueadas; não inventar atributos ou regras para conteúdo futuro.
  **Pronto quando:** os catálogos têm IDs estáveis em inglês, nomes exibidos em português e disponibilidade explícita; apenas Mago e Toca dos Lobos apontam para conteúdo jogável existente.

- [ ] **T064 — Regras puras de seleção** · Dep.: T063
  Implementar seleção padrão, validação e rejeição de opções indisponíveis para classe e mapa em funções puras, com testes.
  **Pronto quando:** os testes confirmam Mago e Toca dos Lobos como padrões, aceitam as opções disponíveis e rejeitam opções futuras ou IDs inválidos.

- [ ] **T065 — Seletor de classe no menu** · Dep.: T064
  Mostrar os seis cartões de classe. Mago pode ser selecionado; Guerreiro, Bárbaro, Feiticeira, Arqueiro e Sacerdote exibem “Em breve”, têm aparência indisponível e não respondem a clique/toque/teclado.
  **Pronto quando:** Mago aparece selecionado inicialmente, o estado selecionado é visível e as outras cinco classes não podem ser ativadas.

- [ ] **T066 — Seletor de mapa no menu** · Dep.: T064
  Mostrar os três cartões de mapa. Toca dos Lobos pode ser selecionado; Caverna do Fogo e Caverna do Escorpião-Serpente exibem “Em breve”, têm aparência indisponível e não respondem a clique/toque/teclado.
  **Pronto quando:** Toca dos Lobos aparece selecionada inicialmente e somente ela pode ser ativada.

- [ ] **T067 — Passagem e retenção do setup da partida** · Dep.: T065, T066
  Enviar os IDs selecionados de classe e mapa ao iniciar `GameScene`; conservar o setup para o botão “Jogar de novo” de `ResultScene`. Não persistir a seleção entre sessões. A Toca dos Lobos utiliza as regras e a arena atualmente implementadas; conteúdo visual específico fica para a Fase 7.
  **Pronto quando:** a partida recebe Mago/Toca dos Lobos e “Jogar de novo” inicia a mesma combinação sem voltar ao padrão por engano.

- [ ] **T068 — Verificação do menu e das opções bloqueadas** · Dep.: T067
  Testar lógica de disponibilidade e passagem do setup; conferir o menu em desktop e celular, incluindo seleção válida, cartões indisponíveis, etiqueta exata “Em breve” e início/repetição de partida.
  **Pronto quando:** somente Mago e Toca dos Lobos iniciam partidas, os cinco cartões de classe e dois de mapa restantes ficam bloqueados e o ciclo completo do MVP continua funcionando.

---

## Fase 7 — Direção de arte e produção de assets (sem integração)

Objetivo: definir uma identidade visual consistente e produzir os arquivos de arte necessários para substituir os placeholders. Esta fase **não altera cenas, código de carregamento, HUD ou gameplay**; a integração fica para uma fase/tarefa posterior.

Direção proposta: fantasia oriental de alto contraste, inspirada no universo e na iconografia de Perfect World, com silhuetas legíveis em escala pequena, acabamento ilustrado estilizado e paleta organizada por elemento. Assets oficiais do Perfect World podem ser usados por decisão do usuário; assets originais podem complementar o conjunto. Manter fundo transparente nos sprites e ícones sempre que aplicável.

- [x] **T070 — Inventário e especificação visual**
  Registrar referências aprovadas, paleta, escala, enquadramento, perspectiva, formatos, dimensões-alvo e convenções de nomes. Inventariar: Mago; inimigos Comum, Rápido e Tanque; cenário/terreno da arena; gema de XP; efeitos de fogo, água e terra; efeitos de status; ícones das 7 skills ativas (incluindo Terra Móvel), 6 passivos e caminhos God/Evil; elementos visuais de menu, HUD, level-up, cultivo, pausa e resultado.
  **Ficha visual:** `docs/art/direction.md`.
  **Pronto quando:** cada família tiver uma ficha com uso, dimensões/alvos, transparência, variantes/frames necessários e referência visual.

- [ ] **T071 — Arte de personagens e inimigos** · Dep.: T070
  Produzir sprites do Mago e dos três tipos de inimigo, incluindo variações/frames de animação requeridos pela apresentação do jogo. Garantir silhuetas distintas e leitura sobre o cenário.
  **Pronto quando:** os arquivos finais estiverem exportados com nomes estáveis, transparência correta e escala consistente, sem alterar o código do jogo.

- [ ] **T072 — Ícones de skills, passivos e cultivo** · Dep.: T070
  Produzir ícones individuais para Marca do Fogo, Fonte Repentina, Chuva de Pedra, Asas da Fênix, Tempestade Flamejante, Tempestade de Areia, Terra Móvel, os seis passivos e os caminhos God/Evil; contemplar leitura em miniatura e variações de caminho quando necessárias.
  **Pronto quando:** todos os ícones existirem nos tamanhos/famílias definidos em T070 e forem visualmente distinguíveis em escala de HUD.

- [ ] **T073 — Efeitos de combate e itens** · Dep.: T070
  Produzir arte da gema de XP, do cenário/terreno da arena e dos efeitos visuais de cada skill, impactos por elemento e estados stun/paralyze, cobrindo as cores de Cultivo God e Evil onde aplicável.
  **Pronto quando:** o conjunto visual cobrir arena, todas as skills e estados do MVP, com sprites/frames separados e nomes mapeados para os comportamentos descritos na spec.

- [ ] **T074 — Elementos gráficos das telas e interface** · Dep.: T070
  Produzir molduras/ornamentos, fundos e elementos decorativos necessários para Menu, HUD, cartas de level-up, escolha de Cultivo, pausa e resultado, sem incluir texto rasterizado que deva permanecer localizável.
  **Pronto quando:** houver inventário completo dos elementos de tela, exportados em camadas/arquivos reutilizáveis e sem textos embutidos.

- [ ] **T075 — Revisão visual e pacote de entrega** · Dep.: T071, T072, T073, T074
  Revisar consistência, transparência, recortes, legibilidade em escala real e organização dos arquivos. Documentar origem/licença dos assets usados e mapa asset → entidade/tela/efeito para a futura integração.
  **Pronto quando:** o pacote final estiver completo, organizado em `public/assets/` (ou diretório acordado), com catálogo, créditos/licenças e checklist de cobertura; nenhum arquivo estiver referenciado pelo jogo nesta fase.

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
