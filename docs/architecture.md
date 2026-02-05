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
