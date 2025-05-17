from flask import Flask, jsonify, render_template, request
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
        additional_claims = {"user_id": user.id, "role": "user"}
        access_token = create_access_token(username, additional_claims=additional_claims)
        return jsonify(access_token=access_token), 200
    return jsonify({"category": "danger","message": "Re-check your username or password"}), 401


@app.post("/admin/login")
def admin_login():
    username = request.json.get('username')
    password = request.json.get('password')
    admin = Admin.query.filter(Admin.username==username).first()
    if admin and check_password_hash(admin.password, password):
        additional_claims = {"user_id": admin.id, "role": "admin"}
        access_token = create_access_token(username, additional_claims=additional_claims)
        return jsonify(access_token=access_token), 200
    return jsonify({"category": "danger","message": "Re-check your username or password"}), 401


@app.post("/admin/dashboard")
@jwt_required()
def admin_dashboard():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only.", "category": "danger"}), 401

    lots = ParkingLot.query.filter(ParkingLot.deleted != True).all()
    lots_dict = {}
    for lot in lots:
        spots = ParkingSpot.query.filter(ParkingSpot.lot_id == lot.id, ParkingSpot.deleted != True).all()
        spots_dict = {}
        for spot in spots:
            reservation = db.session.query(ReserveParkingSpot, User)\
                .join(User, ReserveParkingSpot.user_id == User.id)\
                .filter(ReserveParkingSpot.spot_id == spot.id)\
                .order_by(db.desc(ReserveParkingSpot.parking_timestamp))\
                .all()
            spots_dict[spot.id] = {
                'id': spot.id,
                'status': spot.status,
                'reservations': [
                    {
                        "id": reservation_record.id,
                        "spot_id": reservation_record.spot_id,
                        "user_id": reservation_record.user_id,
                        "vehicle_number": reservation_record.vehicle_number,
                        "parking_time": reservation_record.parking_timestamp,
                        "leaving_time": reservation_record.leaving_timestamp,
                        "parking_cost": reservation_record.parking_cost,
                        "user_name": user.name,
                    }
                    for reservation_record, user in reservation
                ],
            }
        occupied_count = ParkingSpot.query.filter(ParkingSpot.lot_id == lot.id, ParkingSpot.deleted != True, ParkingSpot.status == 'Occupied').count()

        lots_dict[lot.id] = {
            'id': lot.id,
            'name': lot.prime_location_name,
            'address': lot.address,
            'pincode': lot.pincode,
            'price': lot.price,
            'occupied': occupied_count,
            'number_of_spots': lot.number_of_spots,
            'spots': spots_dict
        }

    return jsonify(
        message="Parking lots retrieved successfully",
        category="success",
        lots_dict=lots_dict,
    ), 200



@app.post("/add-lot")
@jwt_required()
def add_lot():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only.", "category": "danger"}), 401

    try:
        name = request.json.get('name')
        address = request.json.get('address')
        pincode = request.json.get('pincode')
        price = request.json.get('price')
        number_of_spots = request.json.get('number_of_spots')

        db.session.add(
            ParkingLot(
                prime_location_name=name,
                address=address,
                pincode=pincode,
                price=price,
                number_of_spots=number_of_spots,
                parking_spots=[ParkingSpot() for _ in range(int(number_of_spots))]
            )
        )
        db.session.commit()
        return jsonify({
            "category": "success",
            "message": "Parking lot added successful!"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Error adding parking lot: {str(e)}",
            "category": "danger"
        }), 500
    

@app.post("/update-lot/<int:lot_id>")
@jwt_required()
def update_lot(lot_id):
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only.", "category": "danger"}), 401

    try:
        data = request.json
        lot = ParkingLot.query.filter_by(id=lot_id).first()
        if not lot:
            return jsonify({"message": "Parking lot not found", "category": "danger"}), 404

        prev_spots_count = lot.number_of_spots
        new_spots_count = int(data.get('number_of_spots', prev_spots_count))

        lot.prime_location_name = data.get('name', lot.prime_location_name)
        lot.address = data.get('address', lot.address)
        lot.pincode = data.get('pincode', lot.pincode)
        lot.price = float(data.get('price', lot.price))
        
        if new_spots_count != prev_spots_count:            
            if new_spots_count > prev_spots_count:
                spots_to_add = new_spots_count - prev_spots_count
                for _ in range(spots_to_add):
                    db.session.add(ParkingSpot(lot_id=lot.id))
            elif new_spots_count < prev_spots_count:
                spots_to_remove = prev_spots_count - new_spots_count
                excess_spots = ParkingSpot.query.filter_by(
                    lot_id=lot.id, 
                    deleted=False
                ).order_by(ParkingSpot.id.desc()).limit(spots_to_remove).all()
                for spot in excess_spots:
                    spot.deleted = True

        lot.number_of_spots = new_spots_count
        db.session.commit()

        return jsonify({
            "message": "Parking lot updated successfully",
            "category": "success"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Error updating parking lot: {str(e)}",
            "category": "danger"
        }), 500


@app.post("/delete-lot/<int:lot_id>")
@jwt_required()
def delete_lot(lot_id):
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only.", "category": "danger"}), 401

    try:
        lot = ParkingLot.query.filter_by(id=lot_id).first()
        if not lot:
            return jsonify({"message": "Parking lot not found", "category": "danger"}), 404
        
        spots = ParkingSpot.query.filter_by(lot_id=lot_id).all()
        for spot in spots:
            if spot.status == "Occupied":
                db.session.rollback()
                return jsonify({
                    "message": "Parking lot has some occupied spots",
                    "category": "danger"
                }), 401
            spot.deleted = True
        lot.deleted = True
        db.session.commit()

        return jsonify({
            "message": "Parking lot deleted successfully",
            "category": "success"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Error updating parking lot: {str(e)}",
            "category": "danger"
        }), 500


@app.post("/delete-spot/<int:spot_id>")
@jwt_required()
def delete_spot(spot_id):
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only.", "category": "danger"}), 401

    try:
        spot = ParkingSpot.query.filter_by(id=spot_id).first()
        if not spot:
            return jsonify({"message": "Parking spot not found", "category": "danger"}), 404
        if spot.status == "Occupied":
            return jsonify({
                "message": "Parking spot is not empty",
                "category": "danger"
            }), 401
        
        lot = ParkingLot.query.filter_by(id=spot.lot_id).first()
        if not lot:
            return jsonify({"message": "Parking lot not found", "category": "danger"}), 404

        spot.deleted = True
        lot.number_of_spots -= 1
        db.session.commit()

        return jsonify({
            "message": "Parking lot deleted successfully",
            "category": "success"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "message": f"Error updating parking lot: {str(e)}",
            "category": "danger"
        }), 500


@app.post("/admin/users")
@jwt_required()
def get_users():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only.", "category": "danger"}), 401

    users = User.query.all()
    user_dict = {
        user.id: {
            'id': user.id,
            'name': user.name,
            'username': user.username,
            'blocked': user.blocked
        } for user in users
    }
    return jsonify(message="Admin users data retrieved successfully.", category="success", user_dict=user_dict), 200


@app.post("/admin/toggle-block/<int:userId>")
@jwt_required()
def toggle_block(userId):
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"message": "Unauthorized access. Admins only.", "category": "danger"}), 401
    
    user = User.query.filter_by(id=userId).first()
    if not user:
        return jsonify({"message": "User not found.", "category": "danger"}), 404
    
    try:
        user.blocked = not user.blocked
        db.session.commit()
    except:
        return jsonify({"message": "Invalid value for 'blocked'.", "category": "danger"}), 400
    else:
        return jsonify({"message": "Changed user block status", "category": "success"}), 200




@app.get('/fetch-claims')
@jwt_required()
def fetch_claims():
    claims=get_jwt()
    return jsonify(claims=claims), 200



if __name__ == "__main__":
    app.run(debug=True)