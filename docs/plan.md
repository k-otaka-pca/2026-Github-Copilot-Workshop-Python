# ポモドーロタイマー 段階的実装計画

## Step 1: Flask バックエンド + 最小限のHTML（機能 #1, #2, #13の一部）

**ゴール**: ブラウザで `http://localhost:5000` にアクセスして画面が表示される

- `app.py` — `create_app()` ファクトリパターンの実装
- `templates/index.html` — タイマー表示の静的HTMLのみ（JS/CSS なし）

**確認方法**: `flask run` でサーバー起動 → ブラウザでページが表示される

## Step 2: CSS スタイリング（機能 #14）

**ゴール**: UIモックに沿った見た目が完成する

- `static/css/style.css` — レイアウト、タイマー円形表示、ボタン、色設計
- `templates/index.html` — CSS の読み込み、クラス名の付与

**確認方法**: ブラウザで見た目がモックと一致している

## Step 3: タイマーロジック（機能 #3〜#7）

**ゴール**: DOM非依存のタイマーロジックが完成し、Node.js で動作確認可能

- `static/js/pomodoroTimer.js` — `PomodoroTimer` クラスの実装
  - コンストラクタ（設定注入）
  - `tick()` — 1秒減算
  - `formatTime()` — `MM:SS` 形式
  - モード切替（work → shortBreak → work → ... → longBreak）
  - 完了ポモドーロ数管理

**確認方法**: Node.js で `require` して手動テスト、または Step 6 のテストで検証

## Step 4: UI層 — タイマー表示と基本操作（機能 #8, #9, #10, #11）

**ゴール**: ブラウザ上でタイマーの開始・一時停止・リセットができる

- `static/js/ui.js` — DOM操作・イベントバインド
  - `setInterval` によるカウントダウン駆動
  - 開始 / 一時停止ボタンの切替
  - リセットボタン
  - 残り時間・モード名のDOM更新
  - プログレス表示（`conic-gradient` or SVG）の更新
- `templates/index.html` — JS ファイルの読み込み

**確認方法**: ブラウザでタイマーを開始→一時停止→リセットの一連操作が動く

## Step 5: タイマー終了通知 + モード自動切替（機能 #4の自動切替部分, #12）

**ゴール**: タイマー終了時に通知が出て、次のモードに自動遷移する

- `ui.js` に追加 — タイマー終了時の処理
  - `Notification API` による通知（権限リクエスト含む）
  - モード切替時のUI更新（色の切替、ラベル更新）
  - 自動的に次のモードのタイマーを開始

**確認方法**: 短い作業時間（テスト設定）で動作確認→通知が出る→休憩モードに切り替わる

## Step 6: テスト（機能 #15, #16）

**ゴール**: バックエンドとタイマーロジックの自動テストが通る

- `tests/test_app.py` — pytest + Flask test_client
  - `GET /` のステータスコード 200
  - レスポンスに期待するHTML要素が含まれる
- `tests/test_timer_logic.js` — Node.js (assert)
  - `tick()` の減算テスト
  - モード切替テスト
  - `formatTime()` のフォーマットテスト
  - 長休憩間隔の判定テスト

**確認方法**: `pytest` と `node tests/test_timer_logic.js` が全パス

## まとめ

| Step | 内容 | 対応ファイル | 対応機能 |
|------|------|-------------|----------|
| 1 | Flask + 最小HTML | `app.py`, `index.html` | #1, #2 |
| 2 | CSSスタイリング | `style.css`, `index.html` | #14 |
| 3 | タイマーロジック | `pomodoroTimer.js` | #3〜#7 |
| 4 | UI基本操作 | `ui.js`, `index.html` | #8〜#11 |
| 5 | 通知 + 自動切替 | `ui.js` | #12, #4(一部) |
| 6 | テスト | `test_app.py`, `test_timer_logic.js` | #15, #16 |
