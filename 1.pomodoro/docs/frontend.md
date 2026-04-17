# フロントエンドドキュメント

## 概要

フロントエンドは Vanilla JavaScript（フレームワークなし）で実装されています。ロジック層とUI層を分離した2モジュール構成です。

---

## モジュール構成

| ファイル | 役割 |
|---------|------|
| `static/js/pomodoroTimer.js` | タイマーロジック（DOM 依存なし） |
| `static/js/ui.js` | DOM 操作・イベントバインド |
| `static/css/style.css` | スタイルシート |
| `templates/index.html` | メインページ HTML テンプレート |

---

## `pomodoroTimer.js` — タイマーロジック

### クラス: `PomodoroTimer`

DOM に依存しない純粋なタイマーロジックを実装します。Node.js 環境でもテスト可能です。

#### コンストラクタ

```javascript
const timer = new PomodoroTimer(config = {})
```

| 引数 | 型 | 説明 |
|------|----|------|
| `config.workDuration` | `number` | 作業時間（秒）。デフォルト: `1500` |
| `config.shortBreakDuration` | `number` | 短休憩時間（秒）。デフォルト: `300` |
| `config.longBreakDuration` | `number` | 長休憩時間（秒）。デフォルト: `900` |
| `config.longBreakInterval` | `number` | 長休憩までの作業完了回数。デフォルト: `4` |

#### メソッド

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `tick()` | `boolean` | 1秒減算する。`isRunning` が `false` または残り時間 0 の場合は何もしない。タイマー完了時（残り時間が 0 になった瞬間）に `true` を返す。 |
| `start()` | `void` | タイマーを開始する（`isRunning = true`）。 |
| `pause()` | `void` | タイマーを一時停止する（`isRunning = false`）。 |
| `reset()` | `void` | タイマーを初期状態（作業モード・完了数 0）にリセットする。 |
| `switchMode(newMode)` | `void` | 指定モードに切り替え、対応する時間をセットする。`isRunning` を `false` にリセットする。 |
| `formatTime()` | `string` | 残り時間を `MM:SS` 形式の文字列で返す（例: `"25:00"`, `"05:00"`）。 |
| `getModeLabel()` | `string` | 現在のモードの日本語ラベルを返す（`"作業中"` / `"短休憩"` / `"長休憩"`）。 |

#### モード自動切替ロジック（`_onComplete`）

`tick()` でタイマーが完了すると内部的に `_onComplete()` が呼ばれます。

- 作業モード完了 → `completedPomodoros` をインクリメント
  - `completedPomodoros % longBreakInterval === 0` の場合 → 長休憩
  - それ以外 → 短休憩
- 休憩モード完了 → 作業モードへ

#### `switchMode` に渡せる値

| 値 | 説明 |
|----|------|
| `"work"` | 作業モード |
| `"shortBreak"` | 短休憩モード |
| `"longBreak"` | 長休憩モード |

それ以外の値を渡すと `Error: Invalid mode: <value>` が throw されます。

#### Node.js での利用

```javascript
const PomodoroTimer = require('./static/js/pomodoroTimer');
const timer = new PomodoroTimer({ workDuration: 5 });
timer.start();
timer.tick();
console.log(timer.formatTime()); // "00:04"
```

---

## `ui.js` — UI 層

`DOMContentLoaded` イベント後に実行されます。`PomodoroTimer` インスタンスを生成し、DOM とのブリッジを担当します。

### DOM 要素の対応

| セレクタ / ID | 変数名 | 用途 |
|-------------|--------|------|
| `.timer-display .time` | `timeDisplay` | 残り時間テキスト表示 |
| `.timer-display .mode-label` | `modeLabel` | モード名テキスト表示 |
| `#start-btn` | `startBtn` | 開始ボタン |
| `#pause-btn` | `pauseBtn` | 一時停止ボタン |
| `#reset-btn` | `resetBtn` | リセットボタン |
| `#completed-count` | `completedCount` | 完了ポモドーロ数テキスト |
| `.progress-ring__fg` | `progressRingFg` | SVG プログレスリング（前景円） |

### 主要な内部関数

| 関数 | 説明 |
|------|------|
| `startTimer()` | `setInterval` でカウントダウンを開始する。既に動作中の場合は何もしない。通知権限をリクエストする。 |
| `pauseTimer()` | タイマーを一時停止し `clearInterval` する。 |
| `resetTimer()` | タイマーをリセットし表示を更新する。 |
| `updateDisplay()` | 残り時間・モードラベル・完了数・プログレスリング・body の `data-mode` 属性を更新する。 |
| `stopInterval()` | `clearInterval` して `intervalId` を `null` にする。 |
| `requestNotificationPermission()` | `Notification.permission` が `"default"` の場合に権限をリクエストする。 |
| `sendNotification(nextMode)` | 通知権限が `"granted"` の場合に `Notification API` で通知を送信する。 |
| `getTotalDuration()` | 現在モードの合計時間（秒）を返す。プログレスリング計算に使用。 |

### タイマー完了時の処理フロー

```
tick() が true を返す
    ↓
stopInterval()
    ↓
sendNotification(timer.mode)  // 次モードのラベルで通知
    ↓
updateDisplay()
    ↓
startTimer()  // 次モードのタイマーを自動開始
```

### Notification API のメッセージ

| 次のモード (`timer.mode`) | タイトル | ボディ |
|--------------------------|---------|-------|
| `"work"` | 休憩終了！ | 作業を再開しましょう 💪 |
| `"shortBreak"` | ポモドーロ完了！ | 短い休憩を取りましょう ☕ |
| `"longBreak"` | ポモドーロ完了！ | 長い休憩を取りましょう 🎉 |

---

## `style.css` — スタイルシート

### CSS カスタムプロパティ

| 変数 | 値 | 説明 |
|------|----|------|
| `--color-work` | `#e74c3c` | 作業モードカラー（赤） |
| `--color-short-break` | `#2ecc71` | 短休憩カラー（緑） |
| `--color-long-break` | `#3498db` | 長休憩カラー（青） |
| `--color-bg` | `#1a1a2e` | 背景色（ダークネイビー） |
| `--color-surface` | `#16213e` | タイマー円内背景 |
| `--color-text` | `#eee` | テキスト色 |
| `--color-text-muted` | `#aaa` | 補助テキスト色 |
| `--timer-size` | `280px` | タイマー円の直径 |
| `--current-color` | `var(--color-work)` | 現在モードの強調色（動的に切替） |

### モード別カラー切替

`ui.js` が `document.body.dataset.mode` をモード名で更新することで、以下の CSS セレクタが自動的に適用されます。

```css
body[data-mode="work"]       { --current-color: var(--color-work); }
body[data-mode="shortBreak"] { --current-color: var(--color-short-break); }
body[data-mode="longBreak"]  { --current-color: var(--color-long-break); }
```

### プログレスリング

SVG の `<circle>` 要素を `stroke-dasharray` / `stroke-dashoffset` で制御します。

```javascript
// 初期化（ui.js）
const circumference = 2 * Math.PI * radius;
progressRingFg.style.strokeDasharray = `${circumference}`;

// 毎秒更新
const elapsed = totalDuration - timer.timeRemaining;
const offset = (elapsed / totalDuration) * circumference;
progressRingFg.style.strokeDashoffset = `-${offset}`;
```

### レスポンシブ対応

`@media (max-width: 400px)` でタイマーサイズとボタンサイズを縮小します。

| プロパティ | 通常 | 400px 以下 |
|-----------|------|-----------|
| `--timer-size` | `280px` | `220px` |
| `.time` font-size | `4rem` | `3rem` |
| button min-width | `120px` | `90px` |

---

## `index.html` — HTML テンプレート

Jinja2 テンプレートとして Flask が配信します。

### 主要な HTML 構造

```html
<body data-mode="work">
  <div class="container">
    <h1>ポモドーロタイマー</h1>
    <div class="timer-display">
      <svg class="progress-ring" viewBox="0 0 288 288">
        <circle class="progress-ring__bg" cx="144" cy="144" r="140" />
        <circle class="progress-ring__fg" cx="144" cy="144" r="140" />
      </svg>
      <div class="mode-label">作業中</div>
      <div class="time">25:00</div>
    </div>
    <div class="controls">
      <button id="start-btn">開始</button>
      <button id="pause-btn">一時停止</button>
      <button id="reset-btn">リセット</button>
    </div>
    <div class="pomodoro-count">
      完了したポモドーロ: <span id="completed-count">0</span>
    </div>
  </div>
</body>
```

### JavaScript ロード順序

`pomodoroTimer.js` が先にロードされ、`ui.js` から `PomodoroTimer` クラスを参照できるようにしています。

```html
<script src="{{ url_for('static', filename='js/pomodoroTimer.js') }}"></script>
<script src="{{ url_for('static', filename='js/ui.js') }}"></script>
```
