from .db import db, environment, SCHEMA, add_prefix_for_prod
from flask_login import UserMixin


class Vault(db.Model, UserMixin):
    __tablename__ = 'vaults'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    field_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('fields.id'), ondelete='CASCADE'))
    order_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('orders.id'), ondelete='CASCADE'))
    position = db.Column(db.String(100))
    type = db.Column(db.String)
    customer_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('customers.id'), ondelete='CASCADE'))
    note = db.Column(db.Text)
    empty = db.Column(db.Boolean)
    
    field = db.relationship('Field', back_populates='vaults')
    order = db.relationship('Order', back_populates='order_vaults')
    customer = db.relationship('Customer', back_populates='vaults')
    attachments = db.relationship('Attachment', back_populates='vault', cascade='all, delete-orphan')

    def to_dict(self):
        customer_name = self.customer.name if self.customer else None

        return {
            'id': self.id,
            'name': self.name,
            'field_id': self.field_id,
            'customer_id': self.customer_id,
            'customer_name': customer_name,
            'position': self.position,
            'order_id': self.order_id,
            'order_name': self.order.name if self.order else None,
            'type': self.type,
            'note': self.note,
            'attachments': [attachment.to_dict() for attachment in self.attachments],
            # 'empty': self.empty # ⚠️ we could probably get rid of this alltogether since customer name EMPTY already signifies this.
        }
