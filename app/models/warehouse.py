from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin
import json


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
    address = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('companies.id')))
    company = db.relationship('Company', back_populates='company_warehouses')

    # Relationships
    warehouse_fields = db.relationship('Field', back_populates='warehouse', foreign_keys='Field.warehouse_id')
    racks = db.relationship('Rack', back_populates='warehouse', cascade='all, delete-orphan')

    def initialize_grid(self):
        """Initialize the field grid as a 2D array with empty cells."""
        return [["" for _ in range(self.cols)] for _ in range(self.rows)]

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'rows': self.rows,
            'cols': self.cols,
            'fieldCapacity': self.field_capacity,
            'warehouseCapacity': self.rows * self.cols * self.field_capacity,
            'fields': [field.to_dict() for field in self.warehouse_fields],
            'companyId': self.company_id,
            'companyName': self.company.name,
            'racks': [rack.to_dict() for rack in self.racks],
            'length': self.length,
            'width': self.width
        }