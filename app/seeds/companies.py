from app.models import db, Company, environment, SCHEMA, User, Warehouse, Order, Customer
from sqlalchemy.sql import text


def seed_companies():
    users = User.query.all()
    warehouses = Warehouse.query.all()
    orders = Order.query.all()
    customers = Customer.query.all()
    c1 = Company(
        company_users=users,
        name="Naglee",
        company_orders=orders,
        company_warehouses=warehouses,
        address="1525 Grand Central Ave, Elmira, NY 14901",
        phone="6077334671"
    )
    c2 = Company(
        name="Acme Logistics",
        address="123 Main St, Springfield, IL 62701",
        phone="2175551234"
    )
    c3 = Company(
        name="Blue Ridge Storage",
        address="456 Blue Ridge Rd, Asheville, NC 28801",
        phone="8285559876"
    )
    c4 = Company(
        name="Metro Warehousing",
        address="789 Metro Ave, New York, NY 10001",
        phone="2125554321"
    )
    db.session.add(c1)
    db.session.add(c2)
    db.session.add(c3)
    db.session.add(c4)
    db.session.commit()

def undo_companies():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.companies RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM companies"))
        
    db.session.commit()