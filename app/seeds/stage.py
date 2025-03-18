from app.models import db, Stage, environment, SCHEMA

def seed_stage():
    # Check if a Stage with id 1 already exists
    existing_stage = Stage.query.get(1)
    
    if existing_stage:
        print("Default Stage already exists.")
    else:
        # Create a new Stage record
        default_stage = Stage(id=1)  # Assuming 'id' is the primary key of the Stage model
        db.session.add(default_stage)
        db.session.commit()
        print("Default Stage created.")

def undo_stage():
    if environment == "production":
        db.session.execute(db.text(f"TRUNCATE TABLE {SCHEMA}.stage RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(db.text("DELETE FROM stage WHERE id = 1"))  # Assuming 'id' is the primary key
    
    db.session.commit()
