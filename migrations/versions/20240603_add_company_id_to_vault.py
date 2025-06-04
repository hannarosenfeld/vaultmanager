"""add company_id to vault

Revision ID: 20240603_add_company_id_to_vault
Revises: 
Create Date: 2024-06-03 13:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20240603_add_company_id_to_vault'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('vaults', sa.Column('company_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_vaults_company_id_companies',
        'vaults', 'companies',
        ['company_id'], ['id']
    )

def downgrade():
    op.drop_constraint('fk_vaults_company_id_companies', 'vaults', type_='foreignkey')
    op.drop_column('vaults', 'company_id')
