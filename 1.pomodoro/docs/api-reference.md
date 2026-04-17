# APIリファレンス

## 概要

ポモドーロタイマーアプリのバックエンドは Flask による最小限の構成であり、REST API は提供していません。サーバーはHTMLページの配信のみを担当し、タイマーロジックはすべてフロントエンド（JavaScript）で処理されます。

---

## エンドポイント一覧

### `GET /`

メインページを返します。

#### リクエスト

```
GET / HTTP/1.1
Host: localhost:5000
```

パラメータ: なし

#### レスポンス

| フィールド | 内容 |
|-----------|------|
| ステータスコード | `200 OK` |
| Content-Type | `text/html; charset=utf-8` |
| ボディ | `index.html` テンプレートをレンダリングした HTML |

#### レスポンス例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>ポモドーロタイマー</title>
    ...
</head>
<body data-mode="work">
    ...
</body>
</html>
```

---

## アプリケーションファクトリ

Flask アプリケーションは `create_app()` ファクトリ関数で生成されます。

```python
from app import create_app

# 通常起動
app = create_app()

# テスト用（config 注入）
app = create_app({"TESTING": True})
```

| 引数 | 型 | 説明 |
|------|----|------|
| `config` | `dict` または `None` | Flask の設定値を上書きする辞書。省略可能。 |

---

## 将来の拡張

現時点では REST API は存在しません。将来的にタイマーセッションの永続化や統計機能を実装する場合は、このドキュメントに追加エンドポイントを記載します。
