# LadduinoIDE

Arduino互換マイコン（AVR/ESP32/M5）向け「KV STUDIO寄り体験」のラダープログラムIDEプロジェクトです（独自実装）。

## 実装状況（MVP）
- Phase 0〜8 の最小骨格を実装
- Domain: デバイス体系切替、表記変換、数値リテラル正規化、Ladder/ST最小IR
- Application: NewProject/Build/Upload/MonitorPoll ユースケース
- Infrastructure: arduino-cli ラッパ、Serial疑似トランスポート
- Plugins: AVR/ESP32/M5 ボード、MCP23017拡張
- UI: 日本語ウィザード状態と語彙ファイル

## 開発コマンド
```bash
npm run lint
npm run test
npm run build
```

## レポート
- `docs/phase-01-report.md`
- `docs/phase-08-report.md`
