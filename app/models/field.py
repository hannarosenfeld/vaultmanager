from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin


class Field(db.Model, UserMixin):
    __tablename__ = 'fields'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True, unique=True)
    name = db.Column(db.String(20))
    type = db.Column(db.String, default="vault")
    vaults = db.relationship('Vault', back_populates='field', lazy='dynamic')
    full = db.Column(db.Boolean, default=False)
    capacity = db.Column(db.Integer, default=3)  # <-- add this line

    warehouse_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('warehouses.id')))
    warehouse = db.relationship('Warehouse', back_populates='warehouse_fields')

    def generate_name(self, col_name, numerical_identifier):
        return f"{col_name}_{numerical_identifier:02d}"

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'vaults': [vault.to_dict() for vault in self.vaults],
            'warehouse_id': self.warehouse_id,
            'full': self.full,
            'capacity': self.capacity,  # <-- include in dict
        }