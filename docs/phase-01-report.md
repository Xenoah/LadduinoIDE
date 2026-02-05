# Phase 0-1 レポート

## Summary（作ったもの）
- モノレポ骨格（apps/packages/plugins/runtime/docs/tests）を作成。
- Clean Architecture の依存方向と禁止事項を定義。
- Domain Core MVPとして以下を実装。
  - DeviceProfile（generic / kv-like）
  - BitContactNotation（kv-decimal-2 / mitsubishi-hex-1）
  - NumericLiteralFormat（decimal / hex-with-prefix）
  - DeviceRef 正規化（bitIndex 主体）
  - R100F <-> R10015 を含む変換
  - 日本語エラー付き検証
  - project.json相当の設定スキーマ
- unit test（vitest）を追加。

## Key files（目的つき）
- `packages/core-domain/src/devices/types.ts`: デバイス体系と正規化モデル。
- `packages/core-domain/src/devices/address-codec.ts`: アドレス解析・表記変換。
- `packages/core-domain/src/devices/numeric-literal.ts`: 数値リテラル正規化。
- `packages/core-domain/src/config/project-config.ts`: project設定スキーマ。
- `packages/core-domain/test/address-codec.test.ts`: 代表ケースの単体テスト。
- `docs/architecture.md`: レイヤー規約と禁止事項。

## How to run（dev/build）
```bash
npm install
npm run lint
npm run test
npm run build
```

## Tests（実行方法）
- `npm run lint`
- `npm run test`
- `npm run build`

## Self Review
1) レイヤー違反
- 追加実装は `packages/core-domain` に限定し、FS/Serial/arduino-cli依存なし。

2) 表記変換の正しさ
- `parseDeviceRef` は表記モードごとに末尾桁数を切替。
- `convertBitNotation` で `R10015 <-> R100F` を相互変換。

3) 例外処理
- 曖昧/範囲外/形式不正/未サポートデバイスを `DomainError` + 日本語メッセージで返す。

4) 拡張性
- DeviceProfile と notation を型と設定オブジェクトで分離。
- plugins/ を先に分離配置し、将来拡張の受け皿を用意。

5) 安全
- FORCEなど危険機能は未実装。Phase 7 でガード前提実装予定。

6) 性能
- Phase 1はパーサ中心のため性能影響は軽微。
- ESP32/M5のタスク割当はPhase 3以降で評価。

## Risk Register（上位5件 + 対策）
1. **npm レジストリアクセス制限**
   - 対策: オフラインミラー or lockfile + vendor cache 導入。
2. **表記省略（R100）の曖昧解釈**
   - 対策: 設定フラグで明示、警告コード追加。
3. **デバイス上限が固定値依存**
   - 対策: project設定から可変化し、UIで検証。
4. **ST/ラダーIR統合時の型不整合**
   - 対策: IR型システムを先行定義（Phase 2前半）。
5. **ボード差分の肥大化**
   - 対策: plugin APIをPhase 3で早期固定。

## Follow-up Tasks（優先度順）
1. Phase 1完了: 解析ルール（曖昧性警告、追加サンプル、境界値）を網羅。
2. project.json / board_profile.json / io_map.json の正式スキーマ化。
3. Application層（usecases）の最小実装（NewProject）。
4. PCランタイム IR 評価器の雛形実装。
5. UIの新規プロジェクトウィザードのワイヤーフレーム化。
