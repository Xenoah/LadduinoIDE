# Phase 8 レポート（MVP完走）

## Summary
- Phase 0: モノレポ骨格、アーキテクチャ規約、開発ガイドを整備。
- Phase 1: DeviceProfile/BitContactNotation/NumericLiteralFormat、正規化パーサ（bitIndex主軸）を実装。
- Phase 2: PC上で扱えるIR雛形（Ladder/STサブセット）を実装。
- Phase 3: Arduino連携のInfrastructureアダプタ（arduino-cliラッパ）を実装。
- Phase 4: UI最小モデル（日本語文字列/新規プロジェクトウィザード状態）を実装。
- Phase 5: MCP23017プラグイン定義（スキーマ/検証ルール）を追加。
- Phase 6: Ladder/ST/Custom C++共存を想定したUseCase入出力を整備。
- Phase 7: SerialオンラインのInMemoryトランスポート（RUN/STOP/FORCE）を実装。
- Phase 8: ドキュメント統合とセルフレビュー更新。

## Key files
- `packages/core-domain/src/devices/address-codec.js`: 表記切替とbitIndex正規化。
- `packages/core-domain/src/ir/ladder-parser.js`: Ladder最小IR。
- `packages/core-domain/src/ir/st-parser.js`: STサブセット解析。
- `packages/app-usecases/src/index.js`: NewProject/Build/Upload/MonitorPoll。
- `packages/infra/src/arduino-cli.js`: arduino-cliラッパ。
- `packages/infra/src/serial-transport.js`: RUN/STOP/FORCEの疑似トランスポート。
- `plugins/io-mcp23017/plugin.json`: MCP23017スキーマ。
- `apps/ide-ui/src/ja.json`: 日本語UI語彙。

## How to run
```bash
npm run lint
npm run test
npm run build
```

## Tests
- core-domain parse/format/convert/numeric/ST/Ladder/validator/project-config

## Self Review
1) レイヤー違反
- Domainは純粋関数群で、OS/FS/CLI依存を持たない。
- arduino-cli/serialはinfraに閉じ込めた。

2) 表記変換の正しさ
- `R10015 <-> R100F` の双方向をテストで検証。
- `bitIndex = channel * 16 + contact` / 逆変換を実装。

3) 例外処理
- 形式不正・範囲外・未サポート・重複割当は日本語メッセージで返す。

4) 拡張性
- ボード/IO拡張はplugins配下JSON定義で分離。
- ST/LadderはIR入力境界を分けて段階拡張しやすい。

5) 安全
- FORCE制御は専用コマンドに限定し、`FORCE_CLEAR_ALL` を分離。

6) 性能
- ESP32/M5のタスク推奨値はboard pluginに保持。
- 実機負荷計測は今後integrationで追加予定。

## Risk Register（上位5件 + 対策）
1. 実機シリアル仕様未固定 -> protocol.mdをv1確定へ進める。
2. STの文法不足 -> サブセット定義を正式化して段階拡張。
3. M5予約ピンの機種差 -> ボードプロファイルをモデル別に分離。
4. MCP23017割当競合の複雑化 -> GUIとDomainで二重検証。
5. arduino-cli環境差異 -> infraでエラーコード正規化。

## Follow-up Tasks（優先度順）
1. Integration test: arduino-cli mock + project wizard end-to-end。
2. UI実装（Electron/Tauri）への接続。
3. Serial v1 CRC/length実装と相互接続テスト。
4. ラダー命令拡張（DIFU/比較/算術/転送）。
5. 実機サンプル（AVR/ESP32/M5/MCP23017）。

## 追加更新（納品向け）
- `apps/ide-ui/server.js` を追加し、UI/APIが実際に起動可能になった。
- UIをモダンなカードレイアウトへ更新し、以下をワンクリック操作可能にした。
  - 新規プロジェクト生成
  - デバイス解析/表記変換
  - オンライン模擬モニタ（RUN/STOP/FORCE）
- `tests/integration/ui-server.test.js` を追加し、エンドポイントの実動テストを追加した。
