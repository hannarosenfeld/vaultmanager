from app.models import db, Order, environment, SCHEMA
from sqlalchemy.sql import text

def seed_orders():
    o1 = Order(name="000")
    o2 = Order(name="001")
    o3 = Order(name="002")

    db.session.add(o1)
    db.session.add(o2)
    db.session.add(o3)

    db.session.commit()

    return [o1, o2, o3]

def undo_orders():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.orders RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM orders"))
        
    db.session.commit()
