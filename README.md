# Maze Puzzler — Phaser + TS + Capacitor + Firebase

## 1) Pré-requisitos
- Node 18+
- Java 17 (pra Android), Android Studio (SDK/NDK); Xcode pra iOS

## 2) Instalação
```bash
pnpm i   # ou npm i / yarn
cp .env.example .env      # preencha suas chaves do Firebase
npm run dev               # abre http://localhost:5173
```

## 3) Build web
```bash
npm run build
npm run preview
```

## 4) Capacitor (Android/iOS)
```bash
npm run build
npm run cap:add:android   # uma vez
npm run cap:sync          # sempre que alterar web
npm run cap:open:android  # abre no Android Studio para build/instalar
```

> Dica: No Firebase, crie Firestore em modo de teste enquanto valida. Regras mínimas depois de validar:
> ```
> rules_version = '2';
> service cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if request.time < timestamp.date(2099,1,1); } } }
> ```
> Ajuste para segurança antes do lançamento.

## 5) Estrutura
```
src/
  engine/mazeGen.ts
  scenes/{BootScene.ts, GameScene.ts}
  services/{firebase.ts, leaderboard.ts, share.ts}
  utils/rng.ts
```

## 6) Próximos passos
- Leaderboard UI (listar top 10 do dia)
- Remote Config para tamanho do labirinto
- Rewarded Ads (AdMob via Capacitor plugin de anúncios ou mediação)
- Deep links para modo desafio