# Survivor PW — direção e especificação visual

Este documento fecha a T070 da Fase 6. Ele descreve o pacote de arte a produzir nas T071–T074; não integra assets ao Phaser nem muda regras do jogo. Dimensões de tela e de gameplay abaixo são referências do código atual e deverão ser revistas se a futura tarefa de integração alterar a apresentação.

## Direção de arte

- **Referência de mundo:** fantasia oriental de Perfect World, usando a aparência dos personagens, criaturas, ambientes e interface do próprio jogo como referência visual primária. Assets oficiais já existem para as sete skills atuais do Mago; consultar `../../public/assets/skills/mage/README.md` e a prévia em `mage-skill-icons-preview.jpg`.
- **Apresentação em jogo:** sprites com silhuetas distintas, contraste forte com o terreno e formas reconhecíveis no tamanho real de jogo. Conservar as formas e cores características dos assets oficiais; evitar filtros que tornem os ícones existentes ilegíveis.
- **Perspectiva:** câmera 2D vista de cima, com leve leitura de três quartos nos personagens, inimigos e cenário para combinar com a fantasia de Perfect World. Sombras ficam sob a criatura ou efeito, sem texto desenhado na arte.
- **Paleta de referência atual:** fogo `#FF5522`, água `#3388FF`, terra `#8A5A2B`, gema de XP `#33FF88`, God `#FFD700` e Evil `#8800FF`. God também usa branco; Evil também usa vermelho `#FF3355`. Usar forma e silhueta além da cor para distinguir status e efeitos.
- **Texto:** nomes, controles, números e demais textos continuam renderizados pela interface em português; não rasterizar texto em fundos, painéis ou ícones.

## Formatos, escala e nomes

- **Arquivos com transparência:** PNG RGBA. Não achatar personagem, inimigo, efeito, ícone ou moldura em fundo opaco.
- **Arquivos opacos de tela/terreno:** PNG RGB, sem transparência. Texturas do terreno devem ser repetíveis sem emenda aparente.
- **Animação:** folhas PNG em atlas com descritor JSON compatível com Phaser; células quadradas de 64×64 px como master 2× para conteúdo de gameplay pequeno. Guardar nomes de frames em inglês e kebab-case. Os tamanhos de exibição abaixo referem-se à escala 1× atualmente usada pelas entidades.
- **Ícones de skill:** PNG individuais, quadrados de 32×32 px, preservando o tamanho de origem dos ícones oficiais baixados. A HUD exibe atualmente um slot de 36×36 px; os ícones podem ser ampliados pelo renderer durante a futura integração, sem alterar os arquivos de origem.
- **Interface e telas:** fundos em 1280×720 px, a resolução base do jogo. Molduras, ornamentos e placas devem ser PNG com transparência e exportados separadamente, para funcionarem com texto dinâmico e escala `FIT`.
- **Convenção de arquivos:** IDs em inglês, kebab-case, sem acentos e com extensão correspondente ao formato. Manter os IDs das entidades/dados quando houver correspondência: `fire-mark`, `sudden-spring`, `stone-rain`, `phoenix-wings`, `flaming-storm`, `sand-storm`, `moving-earth`, `fire-mastery` etc.
- **Organização planejada:** `public/assets/characters/`, `public/assets/enemies/`, `public/assets/environment/`, `public/assets/effects/`, `public/assets/skills/mage/` e `public/assets/ui/`. Fontes e atribuições ficam em documentação Markdown ao lado do catálogo, não misturadas à pasta carregada pelo jogo.

## Catálogo visual

| Família / uso | Tamanho-alvo de origem | Transparência e variantes/frames | Referência visual |
| --- | --- | --- | --- |
| Mago — personagem de jogo | Atlas de quadros 64×64 px (2×); exibição atual 32×32 px | RGBA. Quatro orientações (frente, costas e laterais), caminhada de 4 quadros e repouso de 1 quadro por orientação. Lateral pode ser espelhada. Aura God e Evil como overlays separados, tintáveis. | Página oficial da classe [Mago](https://perfectworld.com.br/o-jogo/criando-seu-heroi/classes/mago); leitura superior compatível com a câmera atual. |
| Inimigo Comum | Quadros 64×64 px (2×); exibição atual 20×20 px | RGBA. Quatro orientações com caminhada de 4 quadros e repouso de 1; silhueta média de leitura neutra. | Famílias de monstros terrestres de Perfect World; consultar criaturas do cliente oficial ao produzir T071. |
| Inimigo Rápido | Quadros 64×64 px (2×); exibição atual 14×14 px | RGBA. Quatro orientações com caminhada de 4 quadros e repouso de 1; silhueta pequena, estreita e claramente distinta do comum. | Criaturas pequenas/ágeis de Perfect World; contraste de silhueta deve permanecer legível a 14 px. |
| Inimigo Tanque | Quadros 64×64 px (2×); exibição atual 32×32 px | RGBA. Quatro orientações com caminhada de 4 quadros e repouso de 1; corpo largo e pesado. | Criaturas robustas, construtos ou monstros grandes de Perfect World; detalhe interno subordinado à silhueta. |
| Arena e terreno | Tile mestre de 512×512 px; variações de detalhe de 128–256 px | PNG opaco e sem emendas no tile base; detalhes/decalques em PNG RGBA separados para composição posterior. | Paisagem e materiais do mundo de Perfect World. A spec ainda deixa mapa infinito ou arena com bordas em aberto; produzir terreno modular que aceite ambos, sem representar uma borda definitiva. |
| Gema de XP | 32×32 px de origem; exibição atual 10×10 px | RGBA; 3 variações de cor/valor usando a mesma silhueta cristalina, se a distinção de valor for necessária. | Gema placeholder atual e cristais/itens brilhantes de Perfect World. Manter leitura da silhueta no tamanho de coleta. |
| Ícones das sete skills atuais do Mago | 32×32 px; slot atual 36×36 px | PNG individuais; sem animação ou variantes de cultivo no arquivo base. Os ícones baixados já estão no diretório canônico da família. | Ícones originais do jogo catalogados pela [PWpedia](https://pwi.fandom.com/wiki/Category:Wizard_Skill_Icons); mapeamento de cada skill em `public/assets/skills/mage/README.md`. |
| Ícones dos seis passivos e de Cultivo God/Evil | 32×32 px; slot atual 36×36 px | PNG RGBA individuais. Um ícone para cada passivo e um símbolo por caminho. Cores/realces de caminho podem ser aplicados na UI; manter ícones neutros quando o mesmo ícone representa ambos os caminhos. | Arquivo de ícones de Mago da PWpedia; nomes/caminhos e cores da [spec](../spec.md) §§5.3–5.4. Confirmar mapeamento dos passivos adaptados na T072. |
| Projétil Marca do Fogo | 24×24 px de origem; textura placeholder atual 12×12 px | RGBA; brilho central e contorno simples. Partículas podem reutilizar três quadros pequenos. | Ícone oficial de Pyrogram como referência de motivo/cor, sem reduzir o ícone de habilidade para representar o projétil. |
| Fonte Repentina | 64×128 px de origem; efeito atual escala até 5× uma textura de 12×12 px | RGBA; coluna vertical em 4–6 quadros; círculos/ripples de chão separados, 64×64 px. | Ícone oficial de Gush e descrição visual T024: círculo no chão seguido de jato ascendente. |
| Chuva de Pedra | Meteoro 48×48 px; sombra de aviso 36×20 px; impacto 96×96 px | RGBA. 4–6 quadros de queda/impacto; sombra de aviso permanece separada e legível no terreno. | Ícone oficial Stone Rain e descrição T025: pequena pedra/meteoro e sombra no chão antes do impacto. |
| Asas da Fênix | Faixa horizontal de 256×64 px; personagem/ave 64×64 px | RGBA. 6 quadros de voo horizontal; asset pode ser rotacionado pela direção da skill. Largura configurável para bônus Evil. | Ícone oficial Will of the Phoenix e descrição T026: fênix de fogo em linha reta, atravessando a horda. |
| Tempestade Flamejante | Efeito radial 256×256 px | RGBA; 6 quadros de pulso em loop curto, base neutra para receber cores elementais e God/Evil. | Ícone oficial Emberstorm e descrição T027: área circular em pulsos centrada no jogador. |
| Tempestade de Areia | Faixa horizontal de 192×32 px; impacto 64×64 px | RGBA; 4–6 quadros de rajada horizontal, rotacionável/esticável até o alvo. Cor base neutra para tint. | Ícone oficial Sandstorm e descrição T028: rajada de areia direcionada a alvo único. |
| Terra Móvel / dash | Faixa/afterimage de 64×32 px; slot de habilidade 32×32 px | RGBA; 3–4 quadros de rastro. Ícone de habilidade usa a arte oficial de Distance Shrink já baixada. Overlay de dash separado do sprite do Mago. | Ícone oficial Distance Shrink, movimento da entidade em [Player.ts](../../src/entities/Player.ts) e cores de Cultivo da spec §5.4. |
| Impactos e partículas elementais | Partículas de 16–24 px; conjuntos de impacto de 64×64 px | RGBA. 3 conjuntos identificáveis (fogo, água, terra), 3–5 quadros por impacto. Base neutra/tintável quando o caminho de Cultivo muda a cor. | Cores por elemento da spec §8 e `BootScene`; ícones das skills como referência de motivos. |
| Status stun e paralyze | Ícones de 20×20 px de origem; exibição atual 10×10 px | RGBA; ícones estáticos separados, com formas diferentes e cores de alto contraste. | Silhuetas já usadas em `BootScene`: triângulo amarelo para stun e círculo ciano para paralyze. |
| Interface de jogo | Painéis e molduras em peças de 9-slice de 64–256 px; slot de skill 36×36 px; barras HP 220×18 px e XP 220×8 px | PNG RGBA para molduras, separadores, botões, slot de skill e selo de cultivo; barras e texto permanecem dinâmicos. | HUD atual em [HudScene.ts](../../src/scenes/HudScene.ts); uso de ícones oficiais nas opções de upgrade e no HUD futuro. |
| Menu, level-up, cultivo, pausa e resultado | Fundos 1280×720 px; placas/painéis ajustados à composição de cada cena | Fundo opaco compartilhável quando adequado; painéis e ornamentos em RGBA separados. Sem palavras, valores ou botões rasterizados. | Título/menu atual; cartas LevelUp de 320×240 px; colunas Cultivation de 460×480 px; resumo do Result. Textos ficam localizáveis na UI. |
| Marca/título e ícone da página | Logo decorativo até 512×256 px; ícone quadrado 128×128 px e 256×256 px | RGBA; versão horizontal para menu e versão quadrada para favicon/ícone. O nome atual é provisório, então arte não deve rasterizar o nome. | Nome provisório Survivor PW; motivos arcanos e orientais do jogo, sem texto embutido. |

## Decisões deixadas para as tarefas seguintes

- Identidade específica (espécie/nome do mundo) dos três arquétipos de inimigo: a spec define só comportamento e porte; T071 deve selecionar criaturas do acervo oficial que caibam em cada silhueta.
- Identidade exata dos ícones dos passivos adaptados: T072 compara os nomes/efeitos da spec com o arquivo oficial antes de fechar o mapeamento.
- Limite visual da arena: permanece modular até a decisão de mapa infinito ou bordas, em aberto na spec.
- Cultivo: efeitos de gameplay devem aceitar tint God/Evil; ícones oficiais das skills mantêm as cores originais, com moldura/selo de caminho na interface quando necessário.

## Referências

- [Mago — Perfect World Brasil, página oficial da classe](https://perfectworld.com.br/o-jogo/criando-seu-heroi/classes/mago)
- [Wizard Skill Icons — catálogo de ícones do PWI](https://pwi.fandom.com/wiki/Category:Wizard_Skill_Icons)
- [Wizard Skill List — nomes e efeitos em inglês usados no mapeamento](https://pwi.fandom.com/wiki/Wizard_Skill_List)
- [Spec do Survivor PW — skills, cultivo e interface](../spec.md)
- [Prévia dos ícones oficiais baixados](mage-skill-icons-preview.jpg)
