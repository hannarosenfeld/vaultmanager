from sqlalchemy.sql import text
from app.models import db, Warehouse, Order, environment, SCHEMA, User, Company

def seed_warehouse(users, orders):
    print("🔍 Seeding warehouse...")
    naglee = Company.query.filter_by(name='Naglee').first()
    print(f"🔍 Company fetched for warehouse: {naglee} (id={getattr(naglee, 'id', None)})")

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

    print(f"✅ Warehouse committed: {warehouse.name} (id={warehouse.id}, company_id={warehouse.company_id})")
    return [warehouse]

def undo_warehouse():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.warehouse RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM warehouse"))
        
    db.session.commit()