from app.models import db, Field, environment, SCHEMA
from sqlalchemy.sql import text

def seed_fields(warehouse_id, orders=None):
    fields = []
    # Create fields for each row
    for i in range(1, 10):
        row_char = chr(64 + i)
        for field_num in range(1, 13):
            name = f"{row_char}{field_num}"
            field_kwargs = {"name": name, "warehouse_id": warehouse_id}
            if orders and (row_char == "C" and i == 1):
                field_kwargs["orders"] = orders
            field = Field(**field_kwargs)
            fields.append(field)
    db.session.add_all(fields)
    db.session.commit()
    all_fields = Field.query.filter_by(warehouse_id=warehouse_id).all()
    return fields


def undo_fields():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.fields RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM fields"))
    db.session.commit()
