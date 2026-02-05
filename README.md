# LadduinoIDE

Arduino互換マイコン（AVR/ESP32/M5）向け「KV STUDIO寄り体験」のラダープログラムIDE（独自実装）です。

## 現在の状態（納品向けMVP）
- **実動UI**: KVライクな3ペインUI（プロジェクト/図形ラダー編集/オンライン）で新規作成・ラダー編集・実行・モニタ操作が可能
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
Arduino互換マイコン（AVR/ESP32/M5）向けのラダープログラムIDEプロジェクトです。

## 現在の到達点
- Phase 0: モノレポ骨格、基本ドキュメント、ビルド/テスト導線
- Phase 1（一部）: DeviceProfile/BitContactNotation/NumericLiteralFormat と正規化パーサ

## クイックスタート
```bash
npm install
npm run lint
npm run test
npm run build
```

## レポート
- `docs/phase-01-report.md`
- `docs/phase-08-report.md`


## ラダー自己保持サンプル
- UIの「自己保持サンプルを読み込む」ボタンで、START/STOP方式の自己保持回路を試せます。
- サンプルファイル: `examples/self-hold.ladder`

- Arduinoコード生成/コンパイル（arduino-cliがある環境では実コンパイル）
