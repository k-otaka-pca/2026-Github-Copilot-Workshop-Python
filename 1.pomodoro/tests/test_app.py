import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app({"TESTING": True})
    with app.test_client() as client:
        yield client


def test_index_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200


def test_index_contains_title(client):
    response = client.get("/")
    html = response.data.decode("utf-8")
    assert "ポモドーロタイマー" in html


def test_index_contains_timer_display(client):
    response = client.get("/")
    html = response.data.decode("utf-8")
    assert "25:00" in html


def test_index_contains_control_buttons(client):
    response = client.get("/")
    html = response.data.decode("utf-8")
    assert 'id="start-btn"' in html
    assert 'id="pause-btn"' in html
    assert 'id="reset-btn"' in html


def test_index_contains_pomodoro_count(client):
    response = client.get("/")
    html = response.data.decode("utf-8")
    assert 'id="completed-count"' in html


def test_index_content_type(client):
    response = client.get("/")
    assert "text/html" in response.content_type


def test_create_app_returns_flask_instance():
    app = create_app()
    assert app is not None
    assert app.testing is False


def test_create_app_with_config():
    app = create_app({"TESTING": True, "SECRET_KEY": "test"})
    assert app.testing is True
    assert app.config["SECRET_KEY"] == "test"
