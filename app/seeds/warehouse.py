from sqlalchemy.sql import text
from app.models import db, Warehouse, Field, Vault,Order, environment, SCHEMA, User  # Import User model

def seed_warehouse(users, fields, orders):
    allFields = Field.query.all()
    user_instances = User.query.all()
    order_instances = Order.query.all()
    
    warehouse = Warehouse()
    warehouse.name = "Warehouse 4"
    warehouse.cols = 9
    warehouse.rows = 12
    warehouse.warehouse_fields = allFields
    warehouse.users = user_instances
    warehouse.orders = order_instances
    warehouse.field_capacity = 2

    db.session.add(warehouse)
    db.session.commit()

    return [warehouse]

def undo_warehouse():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.warehouse RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM warehouse"))
        
    db.session.commit()
