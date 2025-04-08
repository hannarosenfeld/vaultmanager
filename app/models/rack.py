from app.models import db

class Rack(db.Model):
    __tablename__ = 'racks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    warehouse_id = db.Column(db.Integer, db.ForeignKey('warehouses.id'), nullable=False)
    location = db.Column(db.String(50), nullable=False)

    # Relationship with Warehouse
    warehouse = db.relationship('Warehouse', back_populates='racks')

    # Relationship with Shelf
    shelves = db.relationship('Shelf', back_populates='rack', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'capacity': self.capacity,
            'warehouseId': self.warehouse_id,
            'location': self.location,
            'shelves': [shelf.to_dict() for shelf in self.shelves],  # Include shelves in the dictionary
        }