# LadduinoIDE

Arduino互換マイコン（AVR/ESP32/M5）向け「KV STUDIO寄り体験」のラダープログラムIDE（独自実装）です。

## 現在の状態（納品向けMVP）
- **実動UI**: ブラウザで起動できるモダンUI（新規プロジェクト、デバイス解析/変換、オンライン模擬モニタ）
- **Domain/Core**: デバイス体系切替、`R10015 <-> R100F` 変換、数値リテラル正規化
- **Application**: NewProject / Build / Upload / MonitorPoll
- **Infrastructure**: arduino-cli ラッパ、Serial模擬トランスポート
- **Plugin**: AVR/ESP32/M5 ボード、MCP23017定義

## 起動
```bash
npm run dev:ui
```
- ブラウザで `http://localhost:4173` を開く

## テスト/チェック
```bash
npm run lint
npm run test
npm run build
```

## レポート
- `docs/phase-01-report.md`
- `docs/phase-08-report.md`
