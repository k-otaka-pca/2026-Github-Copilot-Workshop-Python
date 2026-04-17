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
