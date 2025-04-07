from app.models import db, Warehouse

class Rack(db.Model):
    __tablename__ = 'racks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouses.id'), nullable=False)

    # Relationship with Pallet
    pallets = db.relationship('Pallet', back_populates='rack', cascade='all, delete-orphan')

    # Relationship with Warehouse
    warehouse = db.relationship('Warehouse', back_populates='racks')
