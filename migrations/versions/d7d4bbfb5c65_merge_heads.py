"""merge heads

Revision ID: d7d4bbfb5c65
Revises: 6a553d8d2b32, 20240603_add_company_id_to_vault
Create Date: 2025-06-03 13:32:42.126494

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd7d4bbfb5c65'
down_revision = ('6a553d8d2b32', '20240603_add_company_id_to_vault')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
