# from app.models import db, Row, Field, environment, SCHEMA
# from sqlalchemy.sql import text


# def seed_rows():
#     row_names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
    
#     for name in row_names:
#         row = Row(name=name)
        
#         db.session.add(row)

#     db.session.commit()


# def undo_rows():
#     if environment == "production":
#         db.session.execute(f"TRUNCATE table {SCHEMA}.rows RESTART IDENTITY CASCADE;")
#     else:
#         db.session.execute(text("DELETE FROM rows"))
        
#     db.session.commit()
