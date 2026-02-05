# アーキテクチャ方針（Clean Architecture）

## レイヤー
- L1 UI: 表示/入力/日本語メッセージ。
- L2 Application: NewProject, Build, Upload, Connect, MonitorPoll, Force, RunStop。
- L3 Domain/Core: Device正規化、IR、検証、コード生成モデル。
- L4 Infrastructure: arduino-cli, serial, file I/O, plugin load。

## 依存方向
`L1 -> L2 -> L3 -> L4`

## 禁止事項
- Domain/CoreからOS API/FS/Serial/CLIへ直接依存しない。
- ボード差分をif地獄で持たない（pluginsへ分離）。
- UI表記状態を内部正規化値へ混在させない。

## このリポジトリの実装境界（現時点）
- Domain: `packages/core-domain/src`
- Application: `packages/app-usecases/src`
- Infrastructure: `packages/infra/src`
- Plugins: `plugins/**/profile.json`, `plugins/io-mcp23017/plugin.json`
- Runtime: `runtime/runtime-avr/src`, `runtime/runtime-esp32/src`
- L1 UI: 表示・操作のみ。
- L2 Application: ユースケース調停。
- L3 Domain/Core: 純粋ロジック。
- L4 Infrastructure: OS/CLI/Serial/FS依存。

## 依存方向
`L1 -> L2 -> L3 -> L4` のみ許可。逆方向依存は禁止。

## 禁止事項
- Domain/Core で file system, serial, arduino-cli への直接依存を禁止。
- ボード差分を巨大な if/switch で実装することを禁止（プラグイン分離）。
- UI状態（表示モード）をドメイン永続値として混在させることを禁止。

## 本コミットの実装範囲
- Phase 0: モノレポ骨格、ビルド/テスト導線。
- Phase 1(一部): デバイス体系切替、ビット表記変換、数値リテラル正規化、project.json スキーマ。
