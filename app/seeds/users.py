from app.models import db, User, environment, SCHEMA
from sqlalchemy.sql import text


# Adds a demo user, you can add other users here if you want
def seed_users():
    admin = User(
        username='admin', email='operations@nagleegroup.com', password='Naglee1525', company_id=1
    )
    hanna = User(
        username='hanna', email='hanna@rosenfeld.com', password='1234', company_id=1
    )
    acme_user = User(
        username='acmejane', email='jane@acmelogistics.com', password='acme123', company_id=2
    )
    blue_user = User(
        username='bluerick', email='rick@blueridge.com', password='blue123', company_id=3
    )
    metro_user = User(
        username='metromary', email='mary@metrowarehousing.com', password='metro123', company_id=4
    )

    db.session.add(admin)
    db.session.add(hanna)
    db.session.add(acme_user)
    db.session.add(blue_user)
    db.session.add(metro_user)
    db.session.commit()

    return [admin, hanna, acme_user, blue_user, metro_user]



# Uses a raw SQL query to TRUNCATE or DELETE the users table. SQLAlchemy doesn't
# have a built in function to do this. With postgres in production TRUNCATE
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities.  With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))
        
    db.session.commit()