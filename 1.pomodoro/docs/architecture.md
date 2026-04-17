# アーキテクチャドキュメント

## 技術スタック

| 層 | 技術 |
|----|------|
| バックエンド | Flask (Python) |
| テンプレートエンジン | Jinja2 |
| フロントエンド | HTML / CSS / JavaScript (Vanilla) |

---

## ディレクトリ構成

```
1.pomodoro/
├── app.py                      # Flask アプリケーション（ファクトリパターン）
├── static/
│   ├── css/
│   │   └── style.css           # スタイルシート
│   └── js/
│       ├── pomodoroTimer.js    # タイマーロジック（DOM 依存なし）
│       └── ui.js               # DOM 操作・イベントバインド
├── templates/
│   └── index.html              # メインページテンプレート
├── tests/
│   ├── test_app.py             # Flask ルートのテスト（pytest）
│   └── test_timer_logic.js     # タイマーロジックのテスト（Node.js）
├── docs/                       # ドキュメント（本ディレクトリ）
└── pomodoro.png                # UI モック画像
```

---

## レイヤー構成

```
[ブラウザ]
    ↕ HTTP GET /
[Flask バックエンド (app.py)]
    ↓ render_template
[HTML テンプレート (index.html)]
    ↓ ロード
[UI 層 (ui.js)]           ← DOM 操作・イベント処理
    ↕ メソッド呼び出し
[ロジック層 (pomodoroTimer.js)]  ← 純粋タイマーロジック
```

---

## バックエンド設計

Flask はページ配信のみを担当し、薄く保ちます。

### アプリケーションファクトリパターン

テストごとに独立した Flask インスタンスを生成できるよう、ファクトリパターンを採用しています。

```python
def create_app(config=None):
    app = Flask(__name__)
    if config:
        app.config.update(config)

    @app.route("/")
    def index():
        return render_template("index.html")

    return app
```

### エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/` | `index.html` をレンダリングして返す |

---

## フロントエンド設計

タイマーのカウントダウン処理はすべてフロントエンド JavaScript で行います。テスタビリティのため、ロジック層と UI 層を明確に分離しています。

### ロジック/UI 分離の方針

| モジュール | 役割 | DOM 依存 |
|-----------|------|---------|
| `pomodoroTimer.js` | タイマー状態管理・ロジック | なし |
| `ui.js` | DOM 操作・イベントバインド・通知 | あり |

---

## CSS 設計

- タイマーの円形プログレス表示は SVG (`stroke-dasharray` / `stroke-dashoffset`) で実現
- モードに応じた色切替は CSS カスタムプロパティ (`--current-color`) と `body[data-mode]` 属性セレクタで実現
- レスポンシブ対応は `flexbox` と `@media` クエリで実現

---

## 処理フロー

```
ユーザー操作（ボタンクリック）
    ↓
イベントハンドラ (ui.js)
    ↓
PomodoroTimer のメソッド呼び出し (pomodoroTimer.js)
    ↓
setInterval で毎秒 tick() を実行
    ↓
DOM 更新（残り時間・モードラベル・プログレスリング）
    ↓
タイマー完了 → 通知送信 + 次モードへ自動切替 + 次タイマー自動開始
```

---

## テスト戦略

| テスト種別 | 対象ファイル | ツール |
|-----------|-------------|--------|
| ユニットテスト（Python） | `tests/test_app.py` | pytest + Flask test_client |
| ユニットテスト（JavaScript） | `tests/test_timer_logic.js` | Node.js (assert モジュール) |

### テスタビリティのための設計判断

| 設計判断 | 効果 |
|----------|------|
| ファクトリパターン | テストごとに独立した Flask インスタンスを生成可能 |
| ロジック/DOM 分離 | ブラウザ不要で JS タイマーロジックをテスト可能 |
| コンストラクタ注入 | テスト時に短い時間設定で動作確認が可能 |

### テスト実行コマンド

```bash
# Python テスト
pytest 1.pomodoro/tests/test_app.py

# JavaScript テスト
node 1.pomodoro/tests/test_timer_logic.js
```
