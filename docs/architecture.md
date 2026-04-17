# ポモドーロタイマー Webアプリケーション アーキテクチャ

## 技術スタック

- **バックエンド**: Flask (Python)
- **フロントエンド**: HTML / CSS / JavaScript (Vanilla)
- **テンプレートエンジン**: Jinja2

## ディレクトリ構成

```
1.pomodoro/
├── app.py                      # Flask アプリケーション（ファクトリパターン）
├── static/
│   ├── css/
│   │   └── style.css           # スタイルシート
│   └── js/
│       ├── pomodoroTimer.js    # タイマーロジック（DOM依存なし）
│       └── ui.js               # DOM操作・イベントバインド
├── templates/
│   └── index.html              # メインページテンプレート
├── tests/
│   ├── test_app.py             # Flask ルートのテスト
│   └── test_timer_logic.js     # タイマーロジックのテスト（Node.js）
└── pomodoro.png                # UIモック
```

## 設計方針

### バックエンド（Flask）— 最小限の役割

Flask はページ配信のみを担当し、薄く保つ。

| 責務 | 説明 |
|------|------|
| ルーティング | `GET /` でメインページを返す |
| テンプレート配信 | Jinja2 で `index.html` をレンダリング |

#### アプリケーションファクトリパターン

テストごとに独立した Flask インスタンスを生成可能にするため、ファクトリパターンを採用する。

```python
from flask import Flask, render_template

def create_app(config=None):
    app = Flask(__name__)
    if config:
        app.config.update(config)

    @app.route("/")
    def index():
        return render_template("index.html")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
```

### フロントエンド — ロジックとDOMの分離

タイマーのカウントダウン処理はすべてフロントエンド（JavaScript）で行う。
テスタビリティのため、ロジック層とUI層を明確に分離する。

#### `pomodoroTimer.js` — 純粋ロジック（DOM依存なし）

| 機能 | 実装方針 |
|------|----------|
| カウントダウン | `tick()` メソッドで1秒分を減算 |
| モード切替 | 作業（25分）/ 短休憩（5分）/ 長休憩（15分）の状態遷移 |
| 時間フォーマット | `MM:SS` 形式の残り時間を返す |

**状態管理:**

```javascript
{
  mode: "work" | "shortBreak" | "longBreak",
  timeRemaining: number,   // 秒
  isRunning: boolean,
  completedPomodoros: number
}
```

**設定の外部化（コンストラクタ注入）:**

| 項目 | 本番 | テスト |
|------|------|--------|
| 作業時間 | 1500秒（25分） | 3秒 |
| 短休憩 | 300秒（5分） | 1秒 |
| 長休憩 | 900秒（15分） | 2秒 |
| 長休憩間隔 | 4回 | 2回 |

#### `ui.js` — DOM操作・イベントバインド

- DOM イベント → `PomodoroTimer` メソッド呼び出し → DOM 更新
- `setInterval` によるカウントダウン駆動
- `Notification API` またはサウンドによるタイマー終了通知
- この層は薄く保ち、E2E テストでカバーする

### CSS 設計

- タイマーの円形プログレス表示は CSS（`conic-gradient`）または SVG（`stroke-dasharray`）で実現
- モード（作業/休憩）に応じた色の切替（例: 作業=赤系、休憩=緑系）
- レスポンシブ対応は `flexbox` / `grid` で実現

## 処理フロー

```
ユーザー操作 → JavaScript イベントハンドラ (ui.js)
    ↓
PomodoroTimer の状態を更新 (pomodoroTimer.js)
    ↓
setInterval で毎秒 tick() を呼び出し
    ↓
DOM更新（残り時間表示 + プログレス表示）
    ↓
タイマー終了 → 通知 + 次のモードへ自動切替
```

## テスト戦略

| テスト種別 | 対象 | ツール |
|-----------|------|--------|
| ユニットテスト（Python） | Flask ルート・レスポンス | pytest + Flask test_client |
| ユニットテスト（JS） | PomodoroTimer クラス | Node.js (assert) |
| E2E テスト | UI全体の動作 | ブラウザテスト（将来対応） |

### テスタビリティの設計ポイント

| 設計判断 | 効果 |
|----------|------|
| ファクトリパターン | テストごとに独立した Flask インスタンスを生成可能 |
| ロジック/DOM 分離 | ブラウザ不要で JS タイマーロジックをテスト可能 |
| 設定の注入 | テスト時に短い時間で動作確認可能 |
| 薄い UI 層 | ユニットテスト対象を明確化し、E2E との責務を分離 |
