from app.models.db import db, environment, SCHEMA, add_prefix_for_prod

class Pallet(db.Model):
    __tablename__ = 'pallets'
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}    

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    shelf_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod('shelves.id')),  # Use add_prefix_for_prod
        nullable=False
    )
    customer_name = db.Column(db.String(100), nullable=False)  # New field
    pallet_number = db.Column(db.String(50), nullable=True)    # New field
    notes = db.Column(db.Text, nullable=True)                 # New field
    file_path = db.Column(db.String(255), nullable=True)
    note = db.Column(db.Text, nullable=True)

    # Relationship with Shelf
    shelf = db.relationship('Shelf', back_populates='pallets')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'weight': self.weight,
            'shelfId': self.shelf_id,
            'customerName': self.customer_name,  # New field
            'palletNumber': self.pallet_number,  # New field
            'notes': self.notes,                # New field
            'filePath': self.file_path,
            'note': self.note,
        }