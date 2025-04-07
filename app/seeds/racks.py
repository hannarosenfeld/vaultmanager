from app.models import db, Rack, Pallet

def seed_racks(warehouse):
    rack1 = Rack(name="Rack 1", capacity=10, warehouse_id=warehouse.id, location="topLeft", pallets=[
        Pallet(name="Pallet 1"),
        Pallet(name="Pallet 2")
    ])
    rack2 = Rack(name="Rack 2", capacity=8, warehouse_id=warehouse.id, location="topRight", pallets=[
        Pallet(name="Pallet 3")
    ])

    db.session.add(rack1)
    db.session.add(rack2)
    db.session.commit()

    return [rack1, rack2]

def undo_racks():
    db.session.execute("DELETE FROM racks")
    db.session.commit()
