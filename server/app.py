from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
db.init_app(app)

if __name__ == '__main__':
    app.run(port=5555, debug=True)