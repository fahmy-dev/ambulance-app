from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db
from flask_migrate import Migrate


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI']= 'sqlite:///ambulance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']= False

CORS(app)
db.init_app(app)
migrate= Migrate(app, db)


if __name__ == '__main__':
    app.run(port=5555, debug=True)