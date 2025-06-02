from app.models import db, Vault, environment, SCHEMA
from sqlalchemy.sql import text


def seed_vaults(customers):
    v1 = Vault(
        name='144',
        customer_id=2, 
        field_id=25, 
        position='3',  # Use numeric string for position (top)
        order_id=1, 
        type="vault"
    )
    v2 = Vault(
        name='266',
        customer_id=3,
        field_id=25,
        position='2',  # Use numeric string for position (middle)
        order_id=2,
        type="vault"
    )
    v3 = Vault(
        name='176',   
        customer_id=1,
        field_id=25,
        position='1',  # Use numeric string for position (bottom)
        order_id=3,
        type="vault"
    )

    db.session.add(v1)
    db.session.add(v2)
    db.session.add(v3)

    db.session.commit()


# Uses a raw SQL query to TRUNCATE or DELETE the vaults table. SQLAlchemy doesn't
# have a built in function to do this. With postgres in production TRUNCATE
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities.  With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_vaults():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.vaults RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM vaults"))
        
    db.session.commit()