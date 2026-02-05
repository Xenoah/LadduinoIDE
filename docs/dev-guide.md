# 開発ガイド

## 前提
- Node.js 22+

## UI起動
```bash
npm run dev:ui
```
- `http://localhost:4173` をブラウザで開く

## 実行コマンド
## セットアップ
```bash
npm install
```

## 実行
```bash
npm run lint
npm run test
npm run build
```

## 主な確認ポイント
- 新規プロジェクト生成（JSONプレビュー）
- ラダーエディタで1スキャン実行（LD/LDN/OUT/SET/RST）
- デバイス解析/表記変換（KV/三菱）
- RUN/STOP/FORCEのオンライン模擬

## サンプル
- `examples/self-hold.ladder`: 自己保持回路（SET/RST）

- 右ペインの「Arduinoコード生成/コンパイル」で、ラダーからArduinoスケッチ生成とコンパイルを実行
- デバイス解析/表記変換（KV/三菱）
- RUN/STOP/FORCEのオンライン模擬
## 補足
- 現在は依存ゼロ（標準Node機能のみ）でテスト可能。
- 実機書き込みは `arduino-cli` が別途必要。
## 対象
現在は `packages/core-domain` のユニットテストを中心に整備。
