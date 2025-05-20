from app.models.db import db, environment, SCHEMA, add_prefix_for_prod  # Import directly from db.py
from app.models.rack import Rack  # Import Rack model
from sqlalchemy.orm import validates  # Import validates for validation logic

class Shelf(db.Model):
    __tablename__ = 'shelves'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    rack_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod('racks.id')),  # Use add_prefix_for_prod
        nullable=False
    )

    # Relationship with Rack
    rack = db.relationship('Rack', back_populates='shelves')

    # Relationship with Pallet
    pallets = db.relationship('Pallet', back_populates='shelf', cascade='all, delete-orphan')

    @validates('rack_id')
    def set_capacity_from_rack(self, key, rack_id):
        """Set the shelf's capacity to match the rack's capacity."""
        rack = db.session.query(Rack).get(rack_id)
        if rack:
            self.capacity = rack.capacity
        return rack_id

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'capacity': self.capacity,  # Include capacity field
            'rackId': self.rack_id,
            'pallets': [pallet.to_dict() for pallet in self.pallets],  # Include pallets
        }