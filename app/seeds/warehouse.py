from sqlalchemy.sql import text
from app.models import db, Warehouse, Field, Vault, Order, environment, SCHEMA, User, Company

def seed_warehouse(users, fields, orders):
    print("🔍 Seeding warehouse...")
    allFields = Field.query.all()
    user_instances = User.query.all()
    order_instances = Order.query.all()
    
    # Fetch the company by name or id
    naglee = Company.query.filter_by(name='Naglee').first()
    print(f"🔍 Company fetched for warehouse: {naglee} (id={getattr(naglee, 'id', None)})")

    # Only pass valid columns to the constructor
    warehouse = Warehouse(
        name="Naglee Main Warehouse",
        cols=9,
        rows=12,
        width=100,
        length=100,
        field_capacity=3,
        company_id=naglee.id if naglee else None
    )
    print(f"🔍 Warehouse to add: {warehouse.name}, company_id={warehouse.company_id}")

    db.session.add(warehouse)
    db.session.commit()

    # Optionally, set relationships after commit if needed
    # warehouse.warehouse_fields = allFields
    # warehouse.orders = order_instances
    # db.session.commit()

    print(f"✅ Warehouse committed: {warehouse.name} (id={warehouse.id}, company_id={warehouse.company_id})")
    return [warehouse]

def undo_warehouse():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.warehouse RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM warehouse"))
        
    db.session.commit()