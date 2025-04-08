from app.models import db

class Pallet(db.Model):
    __tablename__ = 'pallets'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    shelf_id = db.Column(db.Integer, db.ForeignKey('shelves.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=True)  # Path to the uploaded file
    note = db.Column(db.Text, nullable=True)  # Note associated with the pallet

    # Relationship with Shelf
    shelf = db.relationship('Shelf', back_populates='pallets')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'weight': self.weight,
            'shelfId': self.shelf_id,
            'filePath': self.file_path,
            'note': self.note,
        }