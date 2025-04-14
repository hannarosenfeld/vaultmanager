from app.models import SCHEMA, environment

def add_prefix_for_prod(table_name):
    """
    Adds the schema prefix to the table name if the environment is production.
    """
    if environment == "production":
        return f"{SCHEMA}.{table_name}"
    return table_name
