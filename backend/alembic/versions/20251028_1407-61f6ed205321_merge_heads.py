"""Merge heads

Revision ID: 61f6ed205321
Revises: 15ff7144aad5, add_api_keys
Create Date: 2025-10-28 14:07:41.093213

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '61f6ed205321'
down_revision = ('15ff7144aad5', 'add_api_keys')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass