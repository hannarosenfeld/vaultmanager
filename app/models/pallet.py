from app.models import db, Rack

class Pallet(db.Model):
    __tablename__ = 'pallets'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    rack_id = db.Column(db.Integer, db.ForeignKey('racks.id'), nullable=False)

    # Relationship with Rack
    rack = db.relationship('Rack', back_populates='pallets')
