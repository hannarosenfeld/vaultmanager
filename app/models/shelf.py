from app.models import db

class Shelf(db.Model):
    __tablename__ = 'shelves'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    rack_id = db.Column(db.Integer, db.ForeignKey('racks.id'), nullable=False)

    # Relationship with Rack
    rack = db.relationship('Rack', back_populates='shelves')

    # Relationship with Pallet
    pallets = db.relationship('Pallet', back_populates='shelf', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'capacity': self.capacity,
            'rackId': self.rack_id,
            'pallets': [pallet.to_dict() for pallet in self.pallets],  # Include pallets in the dictionary
        }