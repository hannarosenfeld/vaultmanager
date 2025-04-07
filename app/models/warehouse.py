from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin


class Warehouse(db.Model):
    __tablename__ = 'warehouses'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    rows = db.Column(db.Integer)
    cols = db.Column(db.Integer)
    field_capacity = db.Column(db.Integer)
    address = db.Column(db.String)
    company_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('companies.id')))
    company = db.relationship('Company', back_populates='company_warehouses')
    warehouse_fields = db.relationship('Field', back_populates='warehouse', foreign_keys='Field.warehouse_id')
    racks = db.relationship('Rack', back_populates='warehouse', cascade='all, delete-orphan')  # Add relationship with Rack

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'rows': self.rows,
            'cols': self.cols,
            'fieldCapacity': self.field_capacity,
            'warehouseCapacity': self.rows * self.cols * self.field_capacity,
            'fields': [field.to_dict() for field in self.warehouse_fields],
            'racks': [{'name': rack.name, 'location': rack.location} for rack in self.racks],  # Include rack locations
            'companyId': self.company_id,
            'companyName': self.company.name
        }