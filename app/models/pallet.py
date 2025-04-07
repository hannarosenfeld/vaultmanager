from app.models import db, Shelf

class Pallet(db.Model):
    __tablename__ = 'pallets'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    shelf_id = db.Column(db.Integer, db.ForeignKey('shelves.id'), nullable=False)  # Associate with Shelf

    # Relationship with Shelf
    shelf = db.relationship('Shelf', back_populates='pallets')
