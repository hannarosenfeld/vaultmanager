from sqlalchemy.sql import text
from app.models import db, Warehouse, Field, Vault, Order, environment, SCHEMA, User  # Removed Rack and Shelf imports

def seed_warehouse(users, fields, orders):
    allFields = Field.query.all()
    user_instances = User.query.all()
    order_instances = Order.query.all()
    
    # Create a warehouse
    warehouse = Warehouse()
    warehouse.name = "Warehouse 4"
    warehouse.cols = 9
    warehouse.rows = 12
    warehouse.width = 100
    warehouse.length = 100
    warehouse.warehouse_fields = allFields
    warehouse.users = user_instances
    warehouse.orders = order_instances
    warehouse.field_capacity = 3

    db.session.add(warehouse)
    db.session.commit()  # Commit the warehouse without adding racks or shelves

    return [warehouse]

def undo_warehouse():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.warehouse RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM warehouse"))
        
    db.session.commit()