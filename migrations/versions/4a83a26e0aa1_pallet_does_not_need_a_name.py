"""Pallet does not need a name

Revision ID: 4a83a26e0aa1
Revises: 9a583b97b6bc
Create Date: 2025-06-13 16:36:15.394476

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4a83a26e0aa1'
down_revision = '9a583b97b6bc'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('pallets', schema=None) as batch_op:
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=100),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('pallets', schema=None) as batch_op:
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=100),
               nullable=False)

    # ### end Alembic commands ###
