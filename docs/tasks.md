# Tarefas â€” Survivor PW (MVP)

> Documento 3 de 3 do SDD. Executar em ordem. Cada tarefa Ã© pequena, tem dependÃªncias e um critÃ©rio de pronto.
> ReferÃªncias: `spec.md` (o quÃª) e `plan.md` (como).

Legenda: `[ ]` a fazer Â· `[x]` feito Â· **Dep.** = tarefas que precisam estar prontas antes.

---

## Fase 0 â€” Setup

- [x] **T001 â€” Criar o projeto**
  Vite + TypeScript + Phaser 3. ESLint, Prettier e Vitest configurados. Pastas conforme `plan.md` Â§2.
  **Pronto quando:** `npm run dev` abre uma tela preta do Phaser; `npm test` roda.

- [x] **T002 â€” Deploy inicial na Vercel** Â· Dep.: T001
  RepositÃ³rio no GitHub conectado Ã  Vercel.
  **Pronto quando:** a URL pÃºblica abre o jogo; um push na `main` atualiza o site.

- [x] **T003 â€” Cenas vazias e navegaÃ§Ã£o** Â· Dep.: T001
  Boot, Menu, Game, Hud, Pause, LevelUp, Cultivo e Result, com troca entre elas.
  **Pronto quando:** dÃ¡ para ir do Menu ao Game e voltar pelo Result usando botÃµes de teste.

- [x] **T004 â€” Texturas placeholder** Â· Dep.: T003
  Gerar na BootScene formas simples: mago (cÃ­rculo roxo), inimigos (quadrados por tipo), projÃ©teis e gemas, com cores por elemento.
  **Pronto quando:** todas as texturas usadas no MVP existem sem arquivos externos.

## Fase 1 â€” NÃºcleo da partida

- [x] **T010 â€” Dados do jogo** Â· Dep.: T001
  Criar `data/classes.ts`, `skills.ts`, `passives.ts`, `enemies.ts` e `waves.ts` com os valores de `spec.md` Â§5â€“Â§6, e os tipos `SkillDef`, `EnemyDef`, `Modificador` etc. Cada skill e passivo jÃ¡ inclui o bloco `cultivo` (God e Evil) de `spec.md` Â§5.4.
  **Pronto quando:** os arquivos compilam e cobrem todas as skills, passivos, aditivos de cultivo e inimigos do MVP.

- [x] **T011 â€” Jogador e movimento** Â· Dep.: T004, T010
  Mago com HP e velocidade vindos dos dados; movimento por WASD/setas; cÃ¢mera seguindo.
  **Pronto quando:** o mago anda em 8 direÃ§Ãµes numa Ã¡rea maior que a tela.

- [x] **T012 â€” Pool de objetos e grade espacial** Â· Dep.: T001
  `core/Pool.ts` e `core/SpatialGrid.ts`, com testes (inserir, mover, consultar vizinhos, mais prÃ³ximo).
  **Pronto quando:** os testes passam.

- [x] **T013 â€” Inimigos e spawn** Â· Dep.: T011, T012
  `Enemy` com os 3 tipos; `SpawnSystem` lendo `waves.ts`, surgindo fora da tela e perseguindo o jogador.
  **Pronto quando:** as ondas crescem com o tempo e os tipos RÃ¡pido (1:30) e Tanque (3:00) aparecem na hora certa.

- [x] **T014 â€” Dano de contato e morte** Â· Dep.: T013
  Inimigo encosta â†’ dano no jogador (intervalo de 0,5 s, com defesa). HP zero â†’ Result com derrota.
  **Pronto quando:** morrer leva Ã  tela final.

- [x] **T015 â€” CronÃ´metro e vitÃ³ria** Â· Dep.: T011
  CronÃ´metro de partida; aos 25:00 â†’ Result com vitÃ³ria.
  **Pronto quando:** com um modo de tempo acelerado (debug), a vitÃ³ria Ã© disparada.

- [x] **T016 â€” Teste de estresse** Â· Dep.: T013
  Modo debug (F1) mostrando FPS e total de entidades; comando para gerar 300 inimigos.
  **Pronto quando:** 300 inimigos rodam perto de 60 FPS. Se nÃ£o, otimizar antes de seguir.

## Fase 2 â€” Combate e skills

- [x] **T020 â€” Sistema de combate** Â· Dep.: T010
  `CombatSystem` com dano por elemento, maestrias, defesa, **crÃ­tico** e status (lentidÃ£o, reduÃ§Ã£o de dano, **atordoar**, **paralisar**), alÃ©m de **roubo de vida** e cura por acerto. FunÃ§Ã£o pura `calcularStats(def, nivel, passivos, caminho)`. LÃ³gica pura, com testes.
  **Pronto quando:** os testes cobrem as fÃ³rmulas de `plan.md` Â§3.2 e Â§3.3.

- [x] **T021 â€” Base de skills** Â· Dep.: T020, T012
  Interface `Skill`, `SkillSystem` (recarga, disparo, Serenidade) e busca de alvo pela grade.
  **Pronto quando:** uma skill de teste dispara no ritmo certo.

- [x] **T022 â€” Marca do Fogo** Â· Dep.: T021
  ProjÃ©til no inimigo visÃ­vel mais prÃ³ximo; +projÃ©teis nos nÃ­veis 3 e 5. Skill inicial.
  **Pronto quando:** o mago mata inimigos comuns sozinho desde o comeÃ§o.

- [x] **T023 â€” Gemas de XP e coleta** Â· Dep.: T014
  Gema ao matar; atraÃ§Ã£o dentro do raio de coleta; fusÃ£o acima de ~200 gemas.
  **Pronto quando:** coletar gemas enche a barra de XP.

- [x] **T024 â€” Fonte Repentina** Â· Dep.: T021 â€” coluna de Ã¡gua que sobe do chÃ£o sob o inimigo visÃ­vel mais prÃ³ximo (dano instantÃ¢neo, sem projÃ©til), com lentidÃ£o. Visual: cÃ­rculo azul no chÃ£o que cresce para cima em forma de jato vertical e se desfaz.
- [x] **T025 â€” Chuva de Pedra** Â· Dep.: T021 â€” pedra que cai do cÃ©u como meteoro sobre um inimigo aleatÃ³rio visÃ­vel (sombra no chÃ£o antes do impacto).
- [x] **T026 â€” Asas da FÃªnix** Â· Dep.: T021 â€” fÃªnix de fogo em linha reta na direÃ§Ã£o do movimento, atravessa e empurra todos os inimigos no caminho.
- [x] **T027 â€” Tempestade Flamejante** Â· Dep.: T021 â€” Ã¡rea em pulsos ao redor do jogador.
- [x] **T028 â€” Tempestade de Areia** Â· Dep.: T021 â€” rajada de areia do mago atÃ© o inimigo mais forte por perto; dano em alvo Ãºnico e âˆ’50% no dano dele por 3 s.
  **Pronto quando (T024â€“T028):** cada skill funciona nos nÃ­veis 1 a 5 com os valores dos dados.

- [x] **T029 â€” Terra MÃ³vel (dash)** Â· Dep.: T011, T021
  EspaÃ§o/botÃ£o; dash na direÃ§Ã£o do movimento; intocÃ¡vel durante o dash; recarga mostrada.
  **Pronto quando:** o dash atravessa inimigos sem receber dano.

- [x] **T030 â€” Passivos** Â· Dep.: T020
  3 maestrias, Escudo de Terra, Escudo de Fogo e Serenidade.
  **Pronto quando:** cada passivo altera o valor esperado (conferido no modo debug).

## Fase 3 â€” ProgressÃ£o

- [x] **T040 â€” XP e subida de nÃ­vel** Â· Dep.: T023
  Curva `5 + nÃ­vel Ã— 10`; suporte a vÃ¡rios nÃ­veis de uma vez (fila de level-ups). Com testes.
  **Pronto quando:** os testes passam e subir de nÃ­vel dispara o evento.

- [x] **T041 â€” Sorteio de upgrades** Â· Dep.: T040, T030
  3 opÃ§Ãµes, respeitando slots (6+6), nÃ­vel mÃ¡ximo 5 e fallback de +20 HP. Com testes e RNG com semente.
  **Pronto quando:** os testes cobrem todos os casos de `spec.md` Â§7.

- [x] **T042 â€” Tela de level-up** Â· Dep.: T041
  Pausa o jogo; 3 cartas com nome, cor do elemento, nÃ­vel atual â†’ prÃ³ximo e descriÃ§Ã£o; teclas 1/2/3, clique ou toque.
  **Pronto quando:** escolher uma carta aplica o upgrade e retoma a partida.

- [x] **T043 â€” Sistema de Cultivo** Â· Dep.: T040, T020
  `CultivoSystem` guardando o caminho; `XpSystem` insere o Cultivo na fila no nÃ­vel 20 (antes do level-up normal). Testes: nÃ­vel 20 sozinho, subir do 18 ao 22 de uma vez, e skill pega depois da escolha jÃ¡ recebendo o aditivo.
  **Pronto quando:** os testes passam.

- [x] **T044 â€” Tela de Cultivo** Â· Dep.: T043, T042
  Duas colunas (God dourado/branco, Evil vermelho/roxo) listando os aditivos das skills e passivos atuais, lidos de `descricao` nos dados; confirmar com clique, toque ou teclas 1/2. Ãcone do caminho no HUD depois da escolha.
  **Pronto quando:** a escolha pausa o jogo, aplica o caminho e segue para o level-up normal do nÃ­vel 20.

- [x] **T045 â€” Aditivos em cada skill e passivo** Â· Dep.: T043, T022â€“T030
  Garantir que as 6 skills de ataque, a Terra MÃ³vel e os 6 passivos respondem a todos os modificadores da tabela de `spec.md` Â§5.4, incluindo o buff periÃ³dico da Serenidade God.
  **Pronto quando:** no modo debug (comando para forÃ§ar God ou Evil), cada aditivo tem efeito visÃ­vel ou mensurÃ¡vel.

- [x] **T046 â€” Visual do caminho** Â· Dep.: T044
  Efeitos das skills e aura do mago trocam de cor conforme o caminho; nÃºmeros de crÃ­tico maiores e em outra cor; Ã­cone de atordoado/paralisado no inimigo.
  **Pronto quando:** dÃ¡ para identificar o caminho e os status sÃ³ olhando a tela.

## Fase 4 â€” Interface

- [x] **T050 â€” HUD** Â· Dep.: T040, T029
  HP, XP e nÃ­vel, cronÃ´metro, mortes, Ã­cones de skills com nÃ­vel e recarga do dash.
  **Pronto quando:** tudo atualiza em tempo real via EventBus.

- [x] **T051 â€” Menu e pausa** Â· Dep.: T003
  Menu com tÃ­tulo, "Jogar" e controles; pausa com Esc/P e botÃ£o "Continuar / Sair".
  **Pronto quando:** pausar congela tudo, inclusive recargas e spawn.

- [x] **T052 â€” Tela final** Â· Dep.: T015, T014
  VitÃ³ria/derrota, tempo, nÃ­vel, caminho de cultivo, mortes e dano por skill (`StatsTracker`); "Jogar de novo".
  **Pronto quando:** os nÃºmeros batem com a partida jogada.

- [x] **T053 â€” Recorde local** Â· Dep.: T052
  `ScoreService` + `LocalScoreService` salvando o melhor resultado no navegador (maior tempo; mortes como desempate); exibido no menu.
  **Pronto quando:** o recorde continua lÃ¡ depois de recarregar a pÃ¡gina.

- [x] **T054 â€” Controles de toque** Â· Dep.: T011, T029
  Joystick virtual e botÃ£o de dash, sÃ³ em telas de toque; escala `FIT`.
  **Pronto quando:** dÃ¡ para jogar uma partida completa no celular.

## Fase 5 â€” Fechamento do MVP

- [x] **T060 â€” Balanceamento** Â· Dep.: todas as anteriores
  Ajustar `data/` para partidas de 25 minutos. Metas: nÃ­veis iniciais chegam rÃ¡pido e o nÃ­vel 20 (Cultivo) cai por volta do minuto 20; a dificuldade cresce atÃ© o fim. A curva foi verificada por estimativa automatizada de XP e testes; God e Evil mantÃªm seus efeitos ajustados nos dados.
- [x] **T061 â€” Feedback visual** Â· Dep.: T028
  NÃºmeros flutuantes a cada acerto, flash vermelho ao receber dano e partÃ­culas na cor do elemento. Efeitos de partÃ­culas e textos reaproveitados.
- [x] **T062 â€” VerificaÃ§Ã£o dos critÃ©rios de aceite** Â· Dep.: T060, T061
  Passar pelo checklist de `spec.md` Â§9 em Chrome, Firefox, Safari e um celular.
  **Pronto quando:** os 7 critÃ©rios passam. Checklist validado manualmente; MVP entregue.

---

## Fase 6 â€” SeleÃ§Ã£o de classe e mapa no menu

Objetivo: apresentar as classes e os mapas no menu, permitir iniciar somente com uma combinaÃ§Ã£o implementada e manter o setup escolhido durante a partida e sua repetiÃ§Ã£o.

- [x] **T063 â€” CatÃ¡logos de seleÃ§Ã£o** Â· Dep.: T062
  Criar definiÃ§Ãµes de catÃ¡logo para as classes Mago (`mage`), Guerreiro (`warrior`), BÃ¡rbaro (`barbarian`), Feiticeira (`venomancer`), Arqueiro (`archer`) e Sacerdote (`cleric`), e para os mapas Toca dos Lobos (`wolves-den`), Caverna do Fogo (`fire-cave`) e Caverna do EscorpiÃ£o-Serpente (`scorpion-serpent-cave`). Somente Mago e Toca dos Lobos ficam disponÃ­veis. Manter os atributos jogÃ¡veis separados dos metadados de apresentaÃ§Ã£o das classes bloqueadas; nÃ£o inventar atributos ou regras para conteÃºdo futuro.
  **Pronto quando:** os catÃ¡logos tÃªm IDs estÃ¡veis em inglÃªs, nomes exibidos em portuguÃªs e disponibilidade explÃ­cita; apenas Mago e Toca dos Lobos apontam para conteÃºdo jogÃ¡vel existente.

- [ ] **T064 â€” Regras puras de seleÃ§Ã£o** Â· Dep.: T063
  Implementar seleÃ§Ã£o padrÃ£o, validaÃ§Ã£o e rejeiÃ§Ã£o de opÃ§Ãµes indisponÃ­veis para classe e mapa em funÃ§Ãµes puras, com testes.
  **Pronto quando:** os testes confirmam Mago e Toca dos Lobos como padrÃµes, aceitam as opÃ§Ãµes disponÃ­veis e rejeitam opÃ§Ãµes futuras ou IDs invÃ¡lidos.

- [ ] **T065 â€” Seletor de classe no menu** Â· Dep.: T064
  Mostrar os seis cartÃµes de classe. Mago pode ser selecionado; Guerreiro, BÃ¡rbaro, Feiticeira, Arqueiro e Sacerdote exibem â€œEm breveâ€, tÃªm aparÃªncia indisponÃ­vel e nÃ£o respondem a clique/toque/teclado.
  **Pronto quando:** Mago aparece selecionado inicialmente, o estado selecionado Ã© visÃ­vel e as outras cinco classes nÃ£o podem ser ativadas.

- [ ] **T066 â€” Seletor de mapa no menu** Â· Dep.: T064
  Mostrar os trÃªs cartÃµes de mapa. Toca dos Lobos pode ser selecionado; Caverna do Fogo e Caverna do EscorpiÃ£o-Serpente exibem â€œEm breveâ€, tÃªm aparÃªncia indisponÃ­vel e nÃ£o respondem a clique/toque/teclado.
  **Pronto quando:** Toca dos Lobos aparece selecionada inicialmente e somente ela pode ser ativada.

- [ ] **T067 â€” Passagem e retenÃ§Ã£o do setup da partida** Â· Dep.: T065, T066
  Enviar os IDs selecionados de classe e mapa ao iniciar `GameScene`; conservar o setup para o botÃ£o â€œJogar de novoâ€ de `ResultScene`. NÃ£o persistir a seleÃ§Ã£o entre sessÃµes. A Toca dos Lobos utiliza as regras e a arena atualmente implementadas; conteÃºdo visual especÃ­fico fica para a Fase 7.
  **Pronto quando:** a partida recebe Mago/Toca dos Lobos e â€œJogar de novoâ€ inicia a mesma combinaÃ§Ã£o sem voltar ao padrÃ£o por engano.

- [ ] **T068 â€” VerificaÃ§Ã£o do menu e das opÃ§Ãµes bloqueadas** Â· Dep.: T067
  Testar lÃ³gica de disponibilidade e passagem do setup; conferir o menu em desktop e celular, incluindo seleÃ§Ã£o vÃ¡lida, cartÃµes indisponÃ­veis, etiqueta exata â€œEm breveâ€ e inÃ­cio/repetiÃ§Ã£o de partida.
  **Pronto quando:** somente Mago e Toca dos Lobos iniciam partidas, os cinco cartÃµes de classe e dois de mapa restantes ficam bloqueados e o ciclo completo do MVP continua funcionando.

---

## Fase 7 â€” DireÃ§Ã£o de arte e produÃ§Ã£o de assets (sem integraÃ§Ã£o)

Objetivo: definir uma identidade visual consistente e produzir os arquivos de arte necessÃ¡rios para substituir os placeholders. Esta fase **nÃ£o altera cenas, cÃ³digo de carregamento, HUD ou gameplay**; a integraÃ§Ã£o fica para uma fase/tarefa posterior.

DireÃ§Ã£o proposta: fantasia oriental de alto contraste, inspirada no universo e na iconografia de Perfect World, com silhuetas legÃ­veis em escala pequena, acabamento ilustrado estilizado e paleta organizada por elemento. Assets oficiais do Perfect World podem ser usados por decisÃ£o do usuÃ¡rio; assets originais podem complementar o conjunto. Manter fundo transparente nos sprites e Ã­cones sempre que aplicÃ¡vel.

- [x] **T070 â€” InventÃ¡rio e especificaÃ§Ã£o visual**
  Registrar referÃªncias aprovadas, paleta, escala, enquadramento, perspectiva, formatos, dimensÃµes-alvo e convenÃ§Ãµes de nomes. Inventariar: Mago; inimigos Comum, RÃ¡pido e Tanque; cenÃ¡rio/terreno da arena; gema de XP; efeitos de fogo, Ã¡gua e terra; efeitos de status; Ã­cones das 7 skills ativas (incluindo Terra MÃ³vel), 6 passivos e caminhos God/Evil; elementos visuais de menu, HUD, level-up, cultivo, pausa e resultado.
  **Ficha visual:** `docs/art/direction.md`.
  **Pronto quando:** cada famÃ­lia tiver uma ficha com uso, dimensÃµes/alvos, transparÃªncia, variantes/frames necessÃ¡rios e referÃªncia visual.

- [ ] **T071 â€” Arte de personagens e inimigos** Â· Dep.: T070
  Produzir sprites do Mago e dos trÃªs tipos de inimigo, incluindo variaÃ§Ãµes/frames de animaÃ§Ã£o requeridos pela apresentaÃ§Ã£o do jogo. Garantir silhuetas distintas e leitura sobre o cenÃ¡rio.
  **Pronto quando:** os arquivos finais estiverem exportados com nomes estÃ¡veis, transparÃªncia correta e escala consistente, sem alterar o cÃ³digo do jogo.

- [ ] **T072 â€” Ãcones de skills, passivos e cultivo** Â· Dep.: T070
  Produzir Ã­cones individuais para Marca do Fogo, Fonte Repentina, Chuva de Pedra, Asas da FÃªnix, Tempestade Flamejante, Tempestade de Areia, Terra MÃ³vel, os seis passivos e os caminhos God/Evil; contemplar leitura em miniatura e variaÃ§Ãµes de caminho quando necessÃ¡rias.
  **Pronto quando:** todos os Ã­cones existirem nos tamanhos/famÃ­lias definidos em T070 e forem visualmente distinguÃ­veis em escala de HUD.

- [ ] **T073 â€” Efeitos de combate e itens** Â· Dep.: T070
  Produzir arte da gema de XP, do cenÃ¡rio/terreno da arena e dos efeitos visuais de cada skill, impactos por elemento e estados stun/paralyze, cobrindo as cores de Cultivo God e Evil onde aplicÃ¡vel.
  **Pronto quando:** o conjunto visual cobrir arena, todas as skills e estados do MVP, com sprites/frames separados e nomes mapeados para os comportamentos descritos na spec.

- [ ] **T074 â€” Elementos grÃ¡ficos das telas e interface** Â· Dep.: T070
  Produzir molduras/ornamentos, fundos e elementos decorativos necessÃ¡rios para Menu, HUD, cartas de level-up, escolha de Cultivo, pausa e resultado, sem incluir texto rasterizado que deva permanecer localizÃ¡vel.
  **Pronto quando:** houver inventÃ¡rio completo dos elementos de tela, exportados em camadas/arquivos reutilizÃ¡veis e sem textos embutidos.

- [ ] **T075 â€” RevisÃ£o visual e pacote de entrega** Â· Dep.: T071, T072, T073, T074
  Revisar consistÃªncia, transparÃªncia, recortes, legibilidade em escala real e organizaÃ§Ã£o dos arquivos. Documentar origem/licenÃ§a dos assets usados e mapa asset â†’ entidade/tela/efeito para a futura integraÃ§Ã£o.
  **Pronto quando:** o pacote final estiver completo, organizado em `public/assets/` (ou diretÃ³rio acordado), com catÃ¡logo, crÃ©ditos/licenÃ§as e checklist de cobertura; nenhum arquivo estiver referenciado pelo jogo nesta fase.

---

## PÃ³s-MVP (nÃ£o detalhar ainda)

- **T100** Supabase: projeto, tabelas `profiles` e `runs`, RLS.
- **T101** Login anÃ´nimo.
- **T102** `SupabaseScoreService` + Edge Function de validaÃ§Ã£o.
- **T103** Tela de ranking.
- **T110** Sutra do CoraÃ§Ã£o e Orvalho da ManhÃ£ (ativas).
- **T111** Chefes e baÃºs.
- **T112** EvoluÃ§Ãµes: Mar de Chamas, Ira do DragÃ£o de Ãgua, Peso da Montanha.
- **T120** Meta-progressÃ£o (ouro e refino).
- **T130** PrÃ³xima classe.
