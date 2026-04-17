# データモデル仕様

## 概要

現在の実装では、永続化されたデータモデル（データベースや外部ストレージ）は存在しません。タイマーの状態はすべてブラウザのメモリ上で管理され、ページリロード時にリセットされます。

---

## フロントエンド状態モデル

`PomodoroTimer` クラスが管理する内部状態です。

### PomodoroTimer 状態

| プロパティ | 型 | 初期値 | 説明 |
|-----------|-----|--------|------|
| `mode` | `string` | `"work"` | 現在のタイマーモード |
| `timeRemaining` | `number` | `workDuration` | 残り時間（秒） |
| `isRunning` | `boolean` | `false` | タイマー動作中かどうか |
| `completedPomodoros` | `number` | `0` | 完了したポモドーロの累計回数 |

### mode の取りうる値

| 値 | 説明 | デフォルト時間 |
|----|------|-------------|
| `"work"` | 作業モード | 1500秒（25分） |
| `"shortBreak"` | 短休憩モード | 300秒（5分） |
| `"longBreak"` | 長休憩モード | 900秒（15分） |

---

## 設定モデル（コンストラクタ注入）

`PomodoroTimer` のコンストラクタに渡す設定オブジェクトです。

| プロパティ | 型 | デフォルト値 | 説明 |
|-----------|-----|------------|------|
| `workDuration` | `number` | `1500` | 作業時間（秒） |
| `shortBreakDuration` | `number` | `300` | 短休憩時間（秒） |
| `longBreakDuration` | `number` | `900` | 長休憩時間（秒） |
| `longBreakInterval` | `number` | `4` | 長休憩までの作業完了回数 |

### 使用例

```javascript
// デフォルト設定（本番）
const timer = new PomodoroTimer();

// カスタム設定（テスト用）
const timer = new PomodoroTimer({
  workDuration: 3,
  shortBreakDuration: 1,
  longBreakDuration: 2,
  longBreakInterval: 2,
});
```

---

## モード遷移図

```
      作業完了
[work] ──────────────────────────────→ [shortBreak]
  ↑    （completedPomodoros % interval ≠ 0）        |
  |                                                  | 休憩完了
  |    作業完了                                       ↓
  +──────────────────────────────←──────────── [work]
       （completedPomodoros % interval = 0）
          ↓
       [longBreak]
          |
          | 休憩完了
          ↓
        [work]
```

---

## 将来の拡張

将来的にタイマーセッションをサーバー側で永続化する場合、以下のようなデータモデルが考えられます（現時点では未実装）。

```
PomodoroSession {
  id: string
  startedAt: datetime
  completedAt: datetime | null
  mode: "work" | "shortBreak" | "longBreak"
  completedPomodoros: number
}
```
