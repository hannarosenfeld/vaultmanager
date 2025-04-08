"""Add file_path and note to pallets

Revision ID: e1841931a33a
Revises: 59e92e95b8c7
Create Date: 2025-04-08 10:45:45.828367

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e1841931a33a'
down_revision = '59e92e95b8c7'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('pallets', schema=None) as batch_op:
        batch_op.add_column(sa.Column('file_path', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('note', sa.Text(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('pallets', schema=None) as batch_op:
        batch_op.drop_column('note')
        batch_op.drop_column('file_path')

    # ### end Alembic commands ###
