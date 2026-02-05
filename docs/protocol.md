# Serial v1

フレーム: `[magic][version][cmd][len][payload][crc]`

## Commands
- INFO
- READ
- WRITE
- FORCE_SET
- FORCE_CLR
- FORCE_CLEAR_ALL
- RUN
- STOP

## ルール
- len/crc/範囲を必ず検証
- エラー応答はコード返却（日本語表示はIDE側）
# Serial v1（草案）

フレーム形式: `[magic][version][cmd][len][payload][crc]`

- INFO
- READ
- WRITE
- FORCE_SET / FORCE_CLR / FORCE_CLEAR_ALL
- RUN / STOP

詳細は Phase 7 で実装と同時に確定する。
