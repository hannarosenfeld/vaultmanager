"""empty message

Revision ID: 6c5e3cc4fc06
Revises: c11c95c21bbe
Create Date: 2025-04-15 14:12:14.407234

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import Text  # Import Text type

# revision identifiers, used by Alembic.
revision = '6c5e3cc4fc06'
down_revision = 'c11c95c21bbe'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('warehouses', schema=None) as batch_op:
        batch_op.add_column(sa.Column('fieldgrid_location', postgresql.JSON(astext_type=Text()), nullable=True))
        batch_op.drop_column('field_grid_x')
        batch_op.drop_column('field_grid_y')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('warehouses', schema=None) as batch_op:
        batch_op.add_column(sa.Column('field_grid_y', sa.FLOAT(), nullable=True))
        batch_op.add_column(sa.Column('field_grid_x', sa.FLOAT(), nullable=True))
        batch_op.drop_column('fieldgrid_location')

    # ### end Alembic commands ###
