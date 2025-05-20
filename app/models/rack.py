from app.models.db import db, environment, SCHEMA, add_prefix_for_prod  # Import directly from db.py
from sqlalchemy.dialects.postgresql import JSON  # Import JSON type for PostgreSQL

class Rack(db.Model):
    __tablename__ = 'racks'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    capacity = db.Column(db.Integer)
    warehouse_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod('warehouses.id')),

    )
    position = db.Column(JSON, default={"x": 0.0, "y": 0.0})  # Only store x and y here
    orientation = db.Column(db.String(10), default="vertical")
    width = db.Column(db.Float, nullable=False)  # Ensure width is required
    length = db.Column(db.Float, nullable=False)  # Ensure length is required

    # Relationship with Warehouse
    warehouse = db.relationship('Warehouse', back_populates='racks')

    # Relationship with Shelf
    shelves = db.relationship('Shelf', back_populates='rack', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'capacity': self.capacity,  # Ensure capacity is included
            'warehouseId': self.warehouse_id,
            'position': self.position,
            'orientation': self.orientation,
            'width': self.width,
            'length': self.length,
            'shelves': [shelf.to_dict() for shelf in self.shelves],
        }

    def is_within_bounds(self, warehouse):
        """Check if the rack's position is within the warehouse bounds."""
        rack_x = self.position.get("x", 0)
        rack_y = self.position.get("y", 0)
        rack_width = self.width
        rack_length = self.length  # Corrected from height to length

        return (
            0 <= rack_x <= warehouse.width - rack_width and
            0 <= rack_y <= warehouse.length - rack_length  # Corrected from height to length
        )