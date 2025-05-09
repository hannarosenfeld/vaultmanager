"""empty message

Revision ID: 83ddbc8eb3b0
Revises: 264f6bf52a63
Create Date: 2025-02-28 09:17:11.637805

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '83ddbc8eb3b0'
down_revision = '264f6bf52a63'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('warehouse_users')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('warehouse_users',
    sa.Column('user_id', sa.INTEGER(), nullable=False),
    sa.Column('warehouse_id', sa.INTEGER(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['warehouse_id'], ['warehouses.id'], ),
    sa.PrimaryKeyConstraint('user_id', 'warehouse_id')
    )
    # ### end Alembic commands ###
