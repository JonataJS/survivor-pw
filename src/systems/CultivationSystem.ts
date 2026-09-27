import type { Path } from '../data/types';
import { EventBus } from '../core/EventBus';

// spec.md §5.4: guarda o caminho (God/Evil) escolhido no nível 20. A partir
// daí, `path` é passado para calculateStats — qualquer skill/passivo
// equipado depois, mesmo escolhido só num level-up futuro, já recebe o
// aditivo do caminho, porque calculateStats lê o caminho a cada cálculo em
// vez de "aplicar" o bônus uma única vez no momento da escolha.
export class CultivationSystem {
  path: Path | undefined;

  choosePath(path: Path): void {
    this.path = path;
    EventBus.emit('cultivation-chosen', path);
  }
}
