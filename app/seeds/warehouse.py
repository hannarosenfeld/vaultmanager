from sqlalchemy.sql import text
from app.models import db, Warehouse, Field, Vault, Order, Rack, Shelf, environment, SCHEMA, User  # Import Rack and Shelf models

def seed_warehouse(users, fields, orders):
    allFields = Field.query.all()
    user_instances = User.query.all()
    order_instances = Order.query.all()
    
    # Create a warehouse
    warehouse = Warehouse()
    warehouse.name = "Warehouse 4"
    warehouse.cols = 9
    warehouse.rows = 12
    warehouse.warehouse_fields = allFields
    warehouse.users = user_instances
    warehouse.orders = order_instances
    warehouse.field_capacity = 2

    db.session.add(warehouse)
    db.session.flush()  # Flush to get the warehouse ID

    # Define rack locations
    rack_locations = ["topLeft", "topRight", "bottomLeft", "bottomRight", "center"]

    # Add racks to the warehouse
    for i, location in enumerate(rack_locations):
        rack = Rack(
            name=f"Rack {i + 1}",
            capacity=100,
            warehouse_id=warehouse.id,
            location=location
        )
        db.session.add(rack)
        db.session.flush()  # Flush to get the rack ID

        # Add three shelves to each rack
        for j in range(3):
            shelf = Shelf(
                name=f"Shelf {j + 1} of Rack {i + 1}",
                capacity=50,
                rack_id=rack.id
            )
            db.session.add(shelf)

    db.session.commit()

    return [warehouse]

def undo_warehouse():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.warehouse RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.racks RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.shelves RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM warehouse"))
        db.session.execute(text("DELETE FROM racks"))
        db.session.execute(text("DELETE FROM shelves"))
        
    db.session.commit()