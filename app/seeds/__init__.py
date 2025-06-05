from flask.cli import AppGroup
from .users import seed_users, undo_users
from .vaults import seed_vaults, undo_vaults
from .customers import seed_customers, undo_customers
from .fields import seed_fields, undo_fields
from .companies import seed_companies, undo_companies
from .warehouse import seed_warehouse, undo_warehouse
from .orders import seed_orders, undo_orders
from app.models import Field, Warehouse, Customer, Company, User, Order, Vault

from app.models.db import db, environment, SCHEMA

# Creates a seed group to hold our commands
seed_commands = AppGroup('seed')

# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    if environment == "production":
        print("Seeding is disabled in production.")
        return

    companies = None
    users = None
    customers = None
    orders = None
    warehouses = None

    if not Company.query.all():
        companies = seed_companies()
    if not User.query.all():
        users = seed_users()  
    if not Customer.query.all():
        customers = seed_customers()
    if not Order.query.all():
        orders = seed_orders()
    if not Warehouse.query.all():
        warehouses = seed_warehouse(users, orders)  # Don't seed fields here

    # Only seed fields for warehouses that have no fields
    for warehouse in Warehouse.query.all():
        from .fields import seed_fields
        if not warehouse.warehouse_fields or len(warehouse.warehouse_fields) == 0:
            seed_fields(warehouse_id=warehouse.id, orders=orders)

    if not Vault.query.all(): 
        seed_vaults(customers)

@seed_commands.command('undo')
def undo():
    undo_vaults()
    undo_fields()
    undo_warehouse()
    undo_customers()
    undo_users()
    undo_companies()