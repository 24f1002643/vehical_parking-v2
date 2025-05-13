from flask import Flask, jsonify, render_template, redirect, url_for, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Admin, User, ParkingLot, ParkingSpot, ReserveParkingSpot
import os


app = Flask(__name__,
            template_folder='../frontend',
            static_folder='../frontend',
            static_url_path='/static')
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///database.sqlite3"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.config['JWT_SECRET_KEY'] = '0987654321'
jwt = JWTManager(app)


db.init_app(app)
with app.app_context():
    # if file doesn't exist then create database
    if not os.path.exists("./instance/database.sqlite3") or not os.path.getsize("./instance/database.sqlite3"):
        db.create_all()
        db.session.add(Admin(username="admin", password=generate_password_hash("admin")))
        db.session.commit()
        print("Successfully created database")


@app.route('/')
def index():
  return render_template('index.html')


@app.post("/register")
def register():
    name = request.json.get('name')
    username = request.json.get('username')
    password = request.json.get('password')
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"category": "danger", "message": "User already exists!"}), 401
    db.session.add(
        User(
            name=name,
            username=username,
            password=generate_password_hash(password)
        )
    )
    db.session.commit()
    return jsonify({"category": "success", "message": "Registration successful!"}), 200


@app.post("/login")
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    user = User.query.filter(User.username==username).first()
    if user and check_password_hash(user.password, password):
        if user.blocked:
          return jsonify({"category": "danger","message": "Your account is blocked!"}), 401
        access_token = create_access_token(username)
        return jsonify(access_token=access_token), 200
    return jsonify({"category": "danger","message": "Re-check your username or password"}), 401


@app.post("/admin/login")
def admin_login():
    username = request.json.get('username')
    password = request.json.get('password')
    admin = Admin.query.filter(Admin.username==username).first()
    if admin and check_password_hash(admin.password, password):
        access_token = create_access_token(username)
        return jsonify(access_token=access_token), 200
    return jsonify({"category": "danger","message": "Re-check your username or password"}), 401



@app.get('/fetch-claims')
@jwt_required()
def fetch_claims():
    return jsonify(claims=get_jwt()), 200



if __name__ == "__main__":
    app.run(debug=True)