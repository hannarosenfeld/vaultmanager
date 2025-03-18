from app.models import db, Field, environment, SCHEMA
from sqlalchemy.sql import text

def seed_fields(orders):
    fields = []

    # Create fields for each row
    for i in range(1, 10):
        row_char = chr(64 + i)
        for field_num in range(1, 13):
            name = f"{row_char}{field_num}"
            if (row_char == "C" and  i == "1"):
                field = Field(name=name, orders=orders)
            else: 
                field = Field(name=name)
            fields.append(field)
    db.session.add_all(fields)
    db.session.commit()

    return fields


def undo_fields():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.fields RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM fields"))
    db.session.commit()
