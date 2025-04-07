from app.models import db, Warehouse

class Rack(db.Model):
    __tablename__ = 'racks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouses.id'), nullable=False)
    location = db.Column(db.String(50), nullable=False)

    # Relationship with Pallet
    pallets = db.relationship('Pallet', back_populates='rack', cascade='all, delete-orphan')

    # Relationship with Shelf
    shelves = db.relationship('Shelf', back_populates='rack', cascade='all, delete-orphan')

    # Relationship with Warehouse
    warehouse = db.relationship('Warehouse', back_populates='racks')


class Shelf(db.Model):
    __tablename__ = 'shelves'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    rack_id = db.Column(db.Integer, db.ForeignKey('racks.id'), nullable=False)

    # Relationship with Rack
    rack = db.relationship('Rack', back_populates='shelves')

    # Relationship with Pallet
    pallets = db.relationship('Pallet', back_populates='shelf', cascade='all, delete-orphan')
