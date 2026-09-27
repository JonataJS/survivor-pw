# Spec — Survivor PW (nome provisório)

> Documento 1 de 3 do SDD. Define **o quê** o jogo faz. O **como** fica em `plan.md`; a execução, em `tasks.md`.

## 1. Visão

Jogo de ação no navegador, no estilo *Vampire Survivors* (o personagem ataca sozinho, o jogador só se move e escolhe upgrades), com a temática e as skills do *Perfect World*. O primeiro personagem jogável é o **Mago**, com skills baseadas no guia do Místicos do PW (fogo, água e terra).

Projeto pessoal e sem fins comerciais nesta fase. A arte é placeholder (formas geométricas e cores por elemento); nenhum asset oficial do Perfect World entra no repositório.

## 2. Objetivo do MVP

Uma partida jogável de ponta a ponta, publicada na Vercel:
entrar no jogo → jogar com o Mago → sobreviver ou morrer → ver o resultado → jogar de novo.

### Fora do escopo do MVP
- Outras classes (Guerreiro, Bárbaro, Arqueiro etc.)
- Mana/MP (decisão: as skills usam **só tempo de espera**)
- Chefes, baús e evoluções de skill (ultimates do nível 59)
- Meta-progressão (ouro, refino, desbloqueios)
- Backend (Supabase): login, ranking e save ficam para a fase pós-MVP, mas a arquitetura já prevê isso

## 3. Loop da partida

1. O jogador começa no centro de um mapa aberto, com **Marca do Fogo** no nível 1.
2. Inimigos surgem fora da tela e andam na direção do jogador. A quantidade e a força aumentam com o tempo.
3. Inimigos mortos soltam **gemas de experiência**. O jogador coleta ao passar perto (raio de coleta).
4. Ao subir de nível, o jogo pausa e mostra **3 opções** aleatórias: skill nova, melhorar skill existente ou passivo.
5. No **nível 20**, no lugar do level-up normal, abre a tela de **Cultivo**: o jogador escolhe **God** ou **Evil**, e todas as skills ganham o aditivo do caminho escolhido até o fim da partida (seção 5.4).
6. A partida acaba quando:
   - **Vitória:** o jogador sobrevive **10 minutos**.
   - **Derrota:** o HP chega a zero.
7. A tela final mostra tempo sobrevivido, nível, caminho de cultivo, inimigos mortos e dano por skill, com botão "Jogar de novo".

## 4. Controles

| Ação | Teclado | Toque (celular) |
|---|---|---|
| Mover | WASD / setas | Joystick virtual |
| Terra Móvel (dash) | Espaço | Botão na tela |
| Pausar | Esc / P | Botão na tela |
| Escolher upgrade | 1, 2, 3 ou clique | Toque |

## 5. O Mago

Atributos base (valores iniciais de balanceamento, ajustáveis em dados):

| Atributo | Valor |
|---|---|
| HP máximo | 80 (mago tem pouca vida, como no PW) |
| Velocidade | 150 px/s |
| Raio de coleta | 60 px |
| Defesa física | 0 |

Limites de slots: **6 skills de ataque** e **6 passivos**. Toda skill vai do nível 1 ao **5** no MVP.

### 5.1 Skills de ataque do MVP (automáticas)

O "Espera" do PW vira o tempo de recarga. O tempo de conjuração (cast) do PW é ignorado no MVP.

| Skill | Elemento | Comportamento no jogo | Espera base | Upgrades por nível |
|---|---|---|---|---|
| **Marca do Fogo** (inicial) | Fogo | Projétil no inimigo mais próximo | 1,5 s | +dano, +1 projétil nos níveis 3 e 5 |
| **Fonte Repentina** | Água | Coluna de água que **brota do chão embaixo do inimigo mais próximo**, de baixo para cima. Acerta na hora, sem projétil viajando. Aplica **lentidão** (−40% por 2 s) | 3 s | +dano, +duração da lentidão, +1 coluna (em outro inimigo) nos níveis 3 e 5 |
| **Chuva de Pedra** | Terra | Uma pedra cai do céu como um pequeno meteoro sobre um inimigo aleatório na tela; dano alto num alvo | 6 s | +dano, +1 pedra (em outro inimigo) nos níveis 3 e 5 |
| **Asas da Fênix** | Fogo | Uma fênix de fogo sai do mago em **linha reta** na direção do movimento, atravessa e acerta **todos os inimigos no caminho**, **empurrando-os para trás** | 8 s | +dano, +força do empurrão, +alcance, +1 fênix no nível 5 |
| **Tempestade Flamejante** | Fogo | Área grande ao redor do jogador, dano em pulsos | 15 s | +dano, +raio, −espera |
| **Tempestade de Areia** | Terra | Rajada de areia que sai do mago em direção ao inimigo mais forte por perto; dano alto num alvo e **reduz o dano dele em 50%** por 3 s (adaptação do "reduz o acerto" do PW) | 6 s | +dano, +duração do efeito, −espera |

### 5.2 Skill ativa do MVP

| Skill | Comportamento | Espera |
|---|---|---|
| **Terra Móvel** | Dash curto na direção do movimento; fica intocável durante o dash | 6 s (−0,5 s por nível) |

Disponível desde o início. Sobe de nível pelo menu de upgrades, como as outras.

### 5.3 Passivos do MVP

| Passivo | Efeito por nível |
|---|---|
| **Maestria de Fogo** | +10% de dano de fogo |
| **Maestria de Água** | +10% de dano de água |
| **Maestria de Terra** | +10% de dano de terra |
| **Escudo de Terra** | +2 de defesa física (pontos fixos, somados antes do cálculo de dano recebido — a defesa base do mago é 0) |
| **Escudo de Fogo** | +0,5 HP/s de regeneração |
| **Serenidade** | −6% no tempo de espera de todas as skills (adaptada, já que não há mana) |

### 5.4 Cultivo: God ou Evil

Inspirado no cultivo do nível 89 do PW. No jogo, acontece no **nível 20** do personagem, com meta de cair por volta do **minuto 5** da partida (ajustar na curva de XP).

**Regras**
- Escolha **única** por partida e **irreversível**.
- A tela de Cultivo pausa o jogo e mostra os dois caminhos lado a lado, listando o aditivo de **cada skill e passivo que o jogador já tem**, e um resumo do que o caminho faz nas demais.
- Depois da escolha, todas as skills e passivos equipados ganham o aditivo. Os que forem pegos depois já vêm com ele.
- Identidade visual: **God** = dourado/branco, **Evil** = vermelho/roxo. Os efeitos das skills e uma aura no mago mudam de cor.
- Não consome a escolha de upgrade daquele nível: o nível 20 dá o Cultivo e, logo depois, um level-up normal.

**Adaptações do PW:** tempo de conjuração menor e custo menor de HP/MP/chi viram **tempo de espera menor**. Defesa elemental vira **redução de dano recebido**, porque os inimigos do MVP não têm elemento.

**Aditivos (valores iniciais, ajustáveis em dados)**

| Skill / passivo | God | Evil |
|---|---|---|
| Marca do Fogo | 30% de chance de roubar vida: cura 20% do dano causado | −20% de espera |
| Fonte Repentina | Lentidão sobe de −40% para −70% | + dano fixo extra por acerto |
| Chuva de Pedra | −20% de espera | 20% de chance de **atordoar** por 2 s (5 s no PW, reduzido para a horda) |
| Asas da Fênix | −1 s de espera | Fênix 50% mais larga (acerta mais inimigos) |
| Tempestade Flamejante | 20% de chance por acerto de **paralisar** por 3 s | 25% de chance por acerto de curar 1 HP (máx. 5 HP por pulso) |
| Tempestade de Areia | Efeito de −50% de dano dura 50% mais | + dano fixo extra por acerto |
| Terra Móvel | −30% de espera | Dash 50% mais longo |
| Maestrias (cada uma) | +25% de dano do elemento | +5% de chance de **crítico** |
| Escudo de Terra | −15% de dano recebido | Bônus de defesa do escudo +150% |
| Escudo de Fogo | −15% de dano recebido | Regeneração do escudo ×3 |
| Serenidade | A cada 30 s, +100% de dano por 5 s | −20% de espera adicional |

**Novos efeitos necessários no combate**
- **Crítico:** chance base 0%; acerto crítico causa 200% de dano e mostra o número maior e em outra cor.
- **Atordoar / paralisar:** o inimigo para de andar e de causar dano de contato durante o efeito.
- **Roubo de vida:** cura o mago em uma porcentagem do dano causado.

### 5.5 Reservado para depois do MVP

- **Sutra do Coração:** ativa; zera as esperas por 6 s.
- **Orvalho da Manhã:** ativa; cura.
- **Desarmonia:** inimigos próximos fogem e param de atacar.
- **Congelamento, Granizo, Lanterna de Chamas, Terra Fluente, Marca da Chama Divina, Rito de Sacrifício.**
- **Evoluções (nível 59):** Mar de Chamas, Ira do Dragão de Água e Peso da Montanha, liberadas por skill no nível máximo + maestria do elemento.

## 6. Inimigos do MVP

| Tipo | HP | Velocidade | Dano de contato | XP | Aparece a partir de |
|---|---|---|---|---|---|
| Comum | 10 | 60 | 5 | 1 | 0:00 |
| Rápido | 6 | 120 | 4 | 1 | 1:30 |
| Tanque | 60 | 40 | 10 | 5 | 3:00 |

- O dano de contato tem intervalo mínimo de 0,5 s por inimigo.
- A curva de spawn e o multiplicador de HP por minuto ficam num arquivo de dados.
- Meta de desempenho: até **300 inimigos** simultâneos a 60 FPS num notebook comum.

## 7. Progressão na partida

- XP para o próximo nível: `5 + (nível × 10)` (inicial, ajustável).
- Regras das 3 opções de level-up:
  - não oferece skills no nível máximo;
  - não oferece skill nova se os slots estiverem cheios;
  - se não houver nada para oferecer, dá +20 HP.
- No nível 20 abre o Cultivo antes do level-up normal (seção 5.4). Se o jogador subir vários níveis de uma vez passando pelo 20, o Cultivo vem na ordem certa da fila.

## 8. Interface

- **HUD:** barra de HP, barra de XP com o nível, cronômetro, contador de mortes, ícones das skills com o nível de cada uma e a recarga do dash.
- **Tela inicial:** título, botão "Jogar" e controles.
- **Level-up:** 3 cartas com nome, elemento (cor), nível atual → próximo e descrição do efeito.
- **Cultivo:** duas colunas (God e Evil) com os aditivos das skills atuais; botão de confirmar em cada uma. Depois da escolha, um ícone do caminho fica no HUD.
- **Pausa** e **tela final** (seção 3).
- Cores por elemento: fogo = laranja/vermelho, água = azul, terra = marrom/âmbar.
- Textos em português.

## 9. Critérios de aceite do MVP

1. O jogo abre por uma URL da Vercel em Chrome, Firefox e Safari, no desktop e no celular.
2. Uma partida completa (vitória ou derrota) funciona do início ao fim sem erros no console.
3. As 6 skills de ataque, o dash e os 6 passivos funcionam com os efeitos descritos acima.
4. Level-up pausa o jogo e segue as regras da seção 7.
5. Com 300 inimigos na tela, o jogo se mantém perto de 60 FPS.
6. Todo o balanceamento (dano, espera, HP, spawn, aditivos de cultivo) é editável em arquivos de dados, sem mexer na lógica.
7. No nível 20 o Cultivo aparece, e cada aditivo God e Evil da seção 5.4 funciona, inclusive em skills pegas depois da escolha.

## 10. Fase pós-MVP (Supabase)

- Login (anônimo ou por e-mail).
- Salvar resultado das partidas e mostrar **ranking** (maior tempo e mais mortes).
- Meta-progressão: ouro ao fim da partida e upgrades permanentes (inspirados no refino +1 a +12).
- Validação básica de resultados no servidor (Edge Function) para reduzir trapaça no ranking.

## 11. Questões em aberto

- Nome final do jogo.
- O tempo de conjuração (cast) do PW deve ter algum papel? Por exemplo, um atraso visual antes do dano de skills pesadas.
- Mapa infinito ou arena com bordas?
- Arte: continuar com formas geométricas, usar pixel art própria ou gerar sprites?

---
Fonte das skills: [Místicos do PW — Skills Magos](https://misticosdopw.blogspot.com/2011/09/skills-magos.html)
Fonte do cultivo: [Guia PW — Skills God/Evil Mago](https://guiapw.forumbrasil.net/t34-guia-skills-god-evil-mago)
