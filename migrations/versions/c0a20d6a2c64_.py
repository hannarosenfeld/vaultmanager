"""empty message

Revision ID: c0a20d6a2c64
Revises: b3bb6d961e3f
Create Date: 2025-04-17 08:41:37.944702

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import Text

# revision identifiers, used by Alembic.
revision = 'c0a20d6a2c64'
down_revision = 'b3bb6d961e3f'
branch_labels = None
depends_on = None


def upgrade():
    # Add the column as nullable first
    with op.batch_alter_table('racks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('position', postgresql.JSON(astext_type=Text()), nullable=True))

    # Set a default value for existing rows
    op.execute("UPDATE racks SET position = '{\"x\": 0, \"y\": 0}' WHERE position IS NULL")

    # Alter the column to make it NOT NULL
    with op.batch_alter_table('racks', schema=None) as batch_op:
        batch_op.alter_column('position', nullable=False)


def downgrade():
    # Drop the column
    with op.batch_alter_table('racks', schema=None) as batch_op:
        batch_op.drop_column('position')
