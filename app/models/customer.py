from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin


class Customer(db.Model, UserMixin):
    __tablename__ = 'customers'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    vaults = db.relationship('Vault', back_populates='customer')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'vaults': [vault.id for vault in self.vaults], 
            'companies': [company.id for company in self.customer_companies]
        }