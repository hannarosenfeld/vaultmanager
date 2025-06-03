from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin
import json
from sqlalchemy.dialects.postgresql import JSON  # Import JSON type for PostgreSQL
from .field import Field  # <-- Add this import at the top of the file


class Warehouse(db.Model):
    __tablename__ = 'warehouses'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    rows = db.Column(db.Integer)  # Rows in the field grid (specific section of the warehouse)
    cols = db.Column(db.Integer)  # Columns in the field grid
    field_capacity = db.Column(db.Integer)  # Capacity of each field
    length = db.Column(db.Float, nullable=True)  # Overall length of the warehouse (in feet)
    width = db.Column(db.Float, nullable=True)   # Overall width of the warehouse (in feet)
    fieldgrid_location = db.Column(JSON, default={"x": 0.0, "y": 0.0})  # Field grid position as JSON
    address = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('companies.id')))
    company = db.relationship('Company', back_populates='company_warehouses')

    # Relationships
    warehouse_fields = db.relationship('Field', back_populates='warehouse', foreign_keys='Field.warehouse_id')
    racks = db.relationship('Rack', back_populates='warehouse', cascade='all, delete-orphan')
    vaults = db.relationship('Vault', back_populates='warehouse', cascade='all, delete-orphan')

    def initialize_grid(self):
        """Initialize the field grid as a 2D array with empty cells."""
        return [["" for _ in range(self.cols)] for _ in range(self.rows)]

    def validate_rack_position(self, rack):
        """Validate if a rack can be placed in the warehouse."""
        rack_x = rack.position.get("x", 0)
        rack_y = rack.position.get("y", 0)
        rack_width = rack.position.get("width", 0)
        rack_height = rack.position.get("height", 0)

        # Debugging: Log rack position details
        print(f"🔍 Validating rack position: x={rack_x}, y={rack_y}, width={rack_width}, height={rack_height}")

        # Ensure the rack does not overlap with the field grid
        field_x = self.fieldgrid_location.get("x", 0)
        field_y = self.fieldgrid_location.get("y", 0)
        field_width = self.cols
        field_height = self.rows

        overlaps_field_grid = (
            rack_x < field_x + field_width and
            rack_x + rack_width > field_x and
            rack_y < field_y + field_height and
            rack_y + rack_height > field_y
        )

        # Debugging: Log overlap check
        print(f"🔍 Overlaps field grid: {overlaps_field_grid}")

        # Ensure the rack is within warehouse bounds
        within_bounds = (
            0 <= rack_x <= self.width - rack_width and
            0 <= rack_y <= self.length - rack_height
        )

        # Debugging: Log bounds check
        print(f"🔍 Within warehouse bounds: {within_bounds}")

        return within_bounds and not overlaps_field_grid

    def to_dict(self):
        print(f"🔍 to_dict for Warehouse {self.id}: warehouse_fields count = {len(self.warehouse_fields)}")
        db_fields = Field.query.filter_by(warehouse_id=self.id).all()
        print(f"    [to_dict] DB fields for warehouse {self.id}: {[f.id for f in db_fields]}")
        return {
            'id': self.id,
            'name': self.name,
            'rows': self.rows,
            'cols': self.cols,
            'fieldCapacity': self.field_capacity,
            'warehouseCapacity': self.rows * self.cols * self.field_capacity,
            'fields': {field.id: field.to_dict() for field in self.warehouse_fields},
            'companyId': self.company_id,
            'companyName': self.company.name,
            'racks': [rack.to_dict() for rack in self.racks],
            'length': self.length,
            'width': self.width,
            'fieldgridLocation': self.fieldgrid_location
        }