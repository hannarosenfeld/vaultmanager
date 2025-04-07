from app.models import db, Pallet

def seed_pallets(racks):
    pallet1 = Pallet(name="Pallet 1", rack_id=racks[0].id)
    pallet2 = Pallet(name="Pallet 2", rack_id=racks[0].id)
    pallet3 = Pallet(name="Pallet 3", rack_id=racks[1].id)

    db.session.add(pallet1)
    db.session.add(pallet2)
    db.session.add(pallet3)
    db.session.commit()

    return [pallet1, pallet2, pallet3]

def undo_pallets():
    db.session.execute("DELETE FROM pallets")
    db.session.commit()
