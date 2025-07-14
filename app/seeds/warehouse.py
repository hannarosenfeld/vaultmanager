from sqlalchemy.sql import text
from app.models import db, Warehouse, Order, environment, SCHEMA, User, Company

def seed_warehouse(users, orders):
    naglee = Company.query.filter_by(name='Naglee').first()
    
    warehouse = Warehouse(
        name="Naglee Main Warehouse",
        cols=9,
        rows=12,
        width=100,
        length=100,
        field_capacity=3,
        company_id=naglee.id if naglee else None
    )
    db.session.add(warehouse)
    db.session.commit()

    return [warehouse]

def undo_warehouse():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.warehouse RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM warehouse"))
        
    db.session.commit()