from sqlalchemy.sql import text
from app.models import db, Rack, Shelf, Warehouse, environment, SCHEMA

def seed_racks():
    # Fetch all warehouses to associate racks with them
    warehouses = Warehouse.query.all()

    if not warehouses:
        raise Exception("No warehouses found. Please seed warehouses first.")

    racks = []
    for warehouse in warehouses:
        # Define rack locations in the order used by the RackView component
        rack_locations = ["topLeft", "leftVertical", "bottom", "topRight", "rightVertical"]

        for i, location in enumerate(rack_locations):
            # Create a rack
            rack = Rack(
                name=f"Rack {i + 1}",
                capacity=100,
                warehouse_id=warehouse.id,
                location=location
            )
            db.session.add(rack)
            db.session.flush()  # Flush to get the rack ID

            # Add three shelves to the rack
            for j in range(3):
                shelf = Shelf(
                    name=f"Shelf {j + 1} of Rack {i + 1} in {warehouse.name}",
                    capacity=50,
                    rack_id=rack.id
                )
                db.session.add(shelf)

            racks.append(rack)

    db.session.commit()
    return racks


def undo_racks():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.racks RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.shelves RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM racks"))
        db.session.execute(text("DELETE FROM shelves"))

    db.session.commit()