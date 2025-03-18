from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin


class Order(db.Model, UserMixin):
    __tablename__ = 'orders'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    order_vaults = db.relationship('Vault', back_populates="order")
    company_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('companies.id')))
    company = db.relationship('Company', back_populates='company_orders')

    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'vaults': [vault.id for vault in self.order_vaults],
            'companyId' : self.company_id
        }
