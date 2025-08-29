# Wall Tiles Integration Guide

Este documento explica como usar os tiles de parede do diretório `assets/tileset` nos labirintos do jogo.

## Visão Geral

O sistema foi atualizado para usar os tiles de parede individuais (wall1.png até wall9.png) localizados em `assets/tileset/` em vez de um tileset único. Isso permite maior variedade visual e flexibilidade na renderização dos labirintos.

## Arquivos Principais

### 1. WallTileLoader.ts
Responsável por carregar e gerenciar os tiles de parede individuais.

**Funcionalidades:**
- Carregamento assíncrono de tiles de parede
- Cache de configurações de tiles
- Criação de sprites a partir dos tiles
- Seleção de tiles baseada em posição para criar padrões consistentes
- Validação de tiles carregados

### 2. MazeTileRenderer.ts (Atualizado)
Sistema de renderização de labirintos que agora integra com o WallTileLoader.

**Melhorias:**
- Integração com WallTileLoader
- Tamanho de célula atualizado para 16x16 pixels (conforme especificação do projeto)
- Uso de tiles de parede baseados em posição para criar variedade visual
- Fallback para renderização com cores quando tiles não estão disponíveis

### 3. WallTileIntegration.ts
Classe de integração que simplifica o uso do sistema em cenas Phaser.

## Configuração no Manifest

O arquivo `src/assets/manifest.json` foi atualizado para incluir os tiles de parede:

```json
"maze": {
  "walls": [
    {
      "key": "wall1",
      "imagePath": "/assets/tileset/wall1.png",
      "scale": 1.0,
      "anchor": { "x": 0.5, "y": 0.5 }
    },
    // ... wall2 até wall9
  ]
}
```

## Como Usar

### 1. Em uma Cena Phaser

```typescript
import { WallTileIntegration } from '../presentation/WallTileIntegration';

class GameScene extends Phaser.Scene {
  private wallTileIntegration: WallTileIntegration;

  preload() {
    // Inicializar o sistema de tiles de parede
    this.wallTileIntegration = new WallTileIntegration(this);
    this.wallTileIntegration.preloadWallTiles();
  }

  async create() {
    // Aguardar o carregamento dos tiles
    await this.wallTileIntegration.initializeWallTiles();
    
    // Renderizar labirinto com os tiles de parede
    const mazeGroup = this.wallTileIntegration.renderMazeWithWallTiles(mazeData);
  }
}
```

### 2. Uso Direto do MazeTileRenderer

```typescript
import { MazeTileRenderer } from '../presentation/MazeTileRenderer';

class GameScene extends Phaser.Scene {
  private mazeTileRenderer: MazeTileRenderer;

  preload() {
    this.mazeTileRenderer = new MazeTileRenderer(this);
    this.mazeTileRenderer.preloadWallTiles();
  }

  async create() {
    await this.mazeTileRenderer.initializeWallTiles();
    
    // Verificar se os tiles foram carregados
    if (this.mazeTileRenderer.validateWallTiles()) {
      console.log('Todos os tiles de parede carregados com sucesso');
    }
    
    // Renderizar labirinto
    const mazeGroup = this.mazeTileRenderer.renderMaze(mazeData);
  }
}
```

## Especificações dos Tiles

### Tamanho
- **16x16 pixels** - Conforme especificado no arquivo de mapa do projeto
- Todos os tiles devem ter exatamente esse tamanho para alinhamento correto

### Formato
- **PNG** com transparência
- Otimizados para jogos 2D pixel art
- Compatíveis com o sistema de coordenadas do Phaser

### Tiles Disponíveis
- `wall1.png` até `wall9.png` - 9 variações de tiles de parede
- Cada tile pode ser usado para diferentes tipos de parede (reta, canto, junção, etc.)

## Algoritmo de Seleção de Tiles

O sistema usa um algoritmo baseado em posição para selecionar tiles de parede:

```typescript
// Seleção baseada em posição para padrões consistentes
const index = (x + y * 3) % availableTiles.length;
return availableTiles[index];
```

Isso garante que:
- O mesmo tile sempre aparece na mesma posição
- Há variedade visual sem aleatoriedade
- Os padrões são reproduzíveis

## Fallback e Tratamento de Erros

O sistema inclui tratamento robusto de erros:

1. **Tiles não carregados**: Usa renderização com cores sólidas
2. **Tiles ausentes**: Continua com tiles disponíveis
3. **Falhas de carregamento**: Log de erros sem quebrar o jogo

## Validação

O sistema inclui validação automática:

```typescript
const validation = wallTileLoader.validateWallTiles();
if (!validation.isValid) {
  console.warn('Tiles ausentes:', validation.missing);
}
```

## Performance

### Otimizações Implementadas
- Cache de sprites criados
- Carregamento assíncrono não-bloqueante
- Reutilização de texturas
- Cleanup automático de recursos

### Uso de Memória
- Cada tile 16x16 RGBA usa aproximadamente 1KB
- 9 tiles = ~9KB total
- Cache inteligente evita duplicação

## Extensibilidade

### Adicionando Novos Tiles
1. Adicione o arquivo PNG em `assets/tileset/`
2. Atualize o manifest em `src/assets/manifest.json`
3. Adicione a configuração no `WallTileLoader.ts`

### Temas Personalizados
O sistema suporta diferentes temas através do AssetManager:

```typescript
// Carregar tema específico
await assetManager.preloadThemeAssets('forest');
const mazeGroup = mazeTileRenderer.renderMaze(mazeData, 'forest');
```

## Debugging

### Logs Úteis
- `"Loading X wall tiles..."` - Início do carregamento
- `"All wall tiles loaded successfully"` - Carregamento completo
- `"Wall tiles not fully loaded, using fallback rendering"` - Fallback ativo

### Validação Manual
```typescript
// Verificar tiles carregados
const info = wallTileIntegration.getWallTileInfo();
console.log(`${info.count} tiles disponíveis:`, info.tiles);
```

## Troubleshooting

### Problema: Tiles não aparecem
**Solução**: Verificar se `preloadWallTiles()` foi chamado no `preload()` e `initializeWallTiles()` no `create()`

### Problema: Apenas cores sólidas aparecem
**Solução**: Verificar se os arquivos PNG existem em `assets/tileset/` e se os caminhos no manifest estão corretos

### Problema: Performance baixa
**Solução**: Verificar se há muitos sprites sendo criados. O sistema usa cache para evitar duplicação.

## Conclusão

O sistema de tiles de parede oferece:
- ✅ Variedade visual com 9 tiles diferentes
- ✅ Padrões consistentes e reproduzíveis
- ✅ Fallback robusto para casos de erro
- ✅ Performance otimizada com cache
- ✅ Fácil integração em cenas existentes
- ✅ Extensibilidade para novos tiles e temas

O sistema está pronto para uso e pode ser facilmente estendido conforme necessário.