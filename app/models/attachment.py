from .db import db, environment, SCHEMA, add_prefix_for_prod

class Attachment(db.Model):
    __tablename__ = 'attachments'
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}


    id = db.Column(db.Integer, primary_key=True)
    vault_id = db.Column(db.Integer, db.ForeignKey('vaults.id'), nullable=False)
    file_url = db.Column(db.String, nullable=False)
    file_name = db.Column(db.String, nullable=False)
    unique_name = db.Column(db.String, nullable=False)

    vault_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('vaults.id'), ondelete='CASCADE'))
    vault = db.relationship('Vault', back_populates='attachments')

    def to_dict(self):
        return {
            'id': self.id,
            'vault_id': self.vault_id,
            'file_url': self.file_url,
            'file_name': self.file_name,
            'unique_name': self.unique_name,
        }