# アーキテクチャ方針（Clean Architecture）

## レイヤー
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
