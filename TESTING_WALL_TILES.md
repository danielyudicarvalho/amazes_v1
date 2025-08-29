# Como Testar os Wall Tiles

## Status Atual

✅ **O projeto está configurado para usar os wall tiles automaticamente!**

### O que foi implementado:

1. **GameScene atualizado** - Agora carrega e usa os wall tiles automaticamente
2. **Sistema de fallback** - Se os tiles não carregarem, usa renderização gráfica
3. **Preload automático** - Os tiles são carregados no método `preload()`
4. **Inicialização assíncrona** - Os tiles são inicializados no método `create()`

## Como Executar

### 1. Executar o Projeto
```bash
npm run dev
# ou
yarn dev
```

### 2. O que Acontece Automaticamente

Quando você executar o projeto:

1. **No preload()**: Os wall tiles são carregados do diretório `assets/tileset/`
2. **No create()**: O sistema de wall tiles é inicializado
3. **No drawMaze()**: O labirinto é renderizado usando os tiles de parede

### 3. Logs para Verificar

Procure por estes logs no console:

```
✅ "Wall tiles preloaded"
✅ "Wall tiles initialized successfully" 
✅ "Maze rendered with wall tiles"
```

Se algo der errado, você verá:
```
⚠️ "Failed to initialize wall tiles, using fallback rendering"
⚠️ "Failed to render maze with wall tiles, falling back to graphics"
⚠️ "Maze rendered with fallback graphics"
```

## Verificação Visual

### Com Wall Tiles (Sucesso)
- Paredes do labirinto usam os tiles de `assets/tileset/wall1.png` até `wall9.png`
- Cada parede pode ter uma aparência diferente
- Tiles de 16x16 pixels com detalhes visuais

### Com Fallback (Falha)
- Paredes são retângulos verdes sólidos
- Aparência mais simples, sem texturas
- Funciona como antes da implementação

## Arquivos Necessários

Certifique-se de que estes arquivos existem:

```
assets/tileset/
├── wall1.png (16x16 pixels)
├── wall2.png (16x16 pixels)
├── wall3.png (16x16 pixels)
├── wall4.png (16x16 pixels)
├── wall5.png (16x16 pixels)
├── wall6.png (16x16 pixels)
├── wall7.png (16x16 pixels)
├── wall8.png (16x16 pixels)
└── wall9.png (16x16 pixels)
```

## Troubleshooting

### Problema: Apenas retângulos verdes aparecem
**Causa**: Os arquivos PNG não existem ou não podem ser carregados
**Solução**: 
1. Verificar se os arquivos existem em `assets/tileset/`
2. Verificar se os caminhos no manifest estão corretos
3. Verificar se os arquivos têm 16x16 pixels

### Problema: Console mostra erros de carregamento
**Causa**: Caminhos incorretos ou arquivos corrompidos
**Solução**:
1. Verificar os caminhos no `src/assets/manifest.json`
2. Verificar se os arquivos PNG são válidos
3. Verificar permissões de arquivo

### Problema: Performance baixa
**Causa**: Muitos sprites sendo criados
**Solução**: O sistema usa cache automaticamente, mas você pode verificar os logs de performance

## Testando Diferentes Cenários

### 1. Teste com Todos os Tiles
- Coloque todos os 9 arquivos PNG em `assets/tileset/`
- Execute o projeto
- Deve ver variedade visual nas paredes

### 2. Teste com Alguns Tiles Ausentes
- Remova alguns arquivos PNG
- Execute o projeto
- Deve funcionar com os tiles disponíveis

### 3. Teste sem Nenhum Tile
- Remova todos os arquivos PNG
- Execute o projeto
- Deve usar fallback com retângulos verdes

## Exemplo de Integração Manual

Se quiser testar o sistema em uma cena separada:

```typescript
import { WallTileExampleScene } from '../presentation/WallTileExample';

// Adicione ao seu game config:
const config = {
  // ... outras configurações
  scene: [BootScene, LevelSelectScene, GameScene, WallTileExampleScene]
};

// Para navegar para a cena de exemplo:
this.scene.start('WallTileExample');
```

## Próximos Passos

Se tudo estiver funcionando:

1. ✅ **Personalizar tiles**: Substitua os arquivos PNG por seus próprios designs
2. ✅ **Ajustar algoritmo**: Modifique como os tiles são selecionados
3. ✅ **Adicionar temas**: Crie diferentes conjuntos de tiles para diferentes temas
4. ✅ **Otimizar performance**: Ajuste o cache e carregamento conforme necessário

## Conclusão

O sistema está **pronto para uso**! Quando você executar o projeto, ele automaticamente:

- Carrega os wall tiles
- Renderiza o labirinto com os tiles
- Usa fallback se algo der errado
- Mantém compatibilidade com o código existente

Basta executar `npm run dev` e verificar se os tiles aparecem no labirinto! 🚀