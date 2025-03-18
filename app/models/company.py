from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin


class Company(db.Model, UserMixin):
    __tablename__ = 'companies'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String())
    phone = db.Column(db.String(100))
    logo = db.Column(db.String())

    # orders - one to many
    company_orders = db.relationship('Order', back_populates='company', foreign_keys='Order.company_id')

    # user - one to many
    company_users = db.relationship('User', back_populates='company', foreign_keys='User.company_id')

    # warehouses - one to many
    company_warehouses = db.relationship('Warehouse', back_populates='company', foreign_keys='Warehouse.company_id')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'orders': [order.id for order in self.company_orders], 
            'users': [user.id for user in self.company_users], 
            'warehouses': [warehouse.id for warehouse in self.company_warehouses], 
        }