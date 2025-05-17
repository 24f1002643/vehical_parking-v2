from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(20), nullable=False)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    blocked = db.Column(db.Boolean, default=False)
    reservations = db.relationship('ReserveParkingSpot', backref='user', lazy=True)


class ParkingLot(db.Model):
    __tablename__ = 'parking_lot'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    prime_location_name = db.Column(db.String(31), nullable=False)
    address = db.Column(db.String(127), nullable=False)
    pincode = db.Column(db.String(7), nullable=False)
    price = db.Column(db.Float, nullable=False) #price per hour
    number_of_spots = db.Column(db.Integer, nullable=False)
    deleted = db.Column(db.Boolean, default=False)
    parking_spots = db.relationship('ParkingSpot', backref='lot', lazy=True)


class ParkingSpot(db.Model):
    __tablename__ = 'parking_spot'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('parking_lot.id'), nullable=False)
    status = db.Column(db.Enum('Occupied', 'Available', name='spot_status'), default='Available')
    deleted = db.Column(db.Boolean, default=False)
    reservations = db.relationship('ReserveParkingSpot', backref='spot', lazy=True)


class ReserveParkingSpot(db.Model):
    __tablename__ = 'reserve_parking_spot'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    spot_id = db.Column(db.Integer, db.ForeignKey('parking_spot.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    vehicle_number = db.Column(db.String(15), nullable=False)
    parking_timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    leaving_timestamp = db.Column(db.DateTime)
    parking_cost = db.Column(db.Float)


