"""empty message

Revision ID: 82b7dc435af8
Revises: 
Create Date: 2021-01-21 23:19:34.408936

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '82b7dc435af8'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('movie',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('director', sa.String(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('country', sa.String(), nullable=False),
    sa.Column('category', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_movie_category'), 'movie', ['category'], unique=False)
    op.create_index(op.f('ix_movie_country'), 'movie', ['country'], unique=False)
    op.create_index(op.f('ix_movie_director'), 'movie', ['director'], unique=False)
    op.create_index(op.f('ix_movie_id'), 'movie', ['id'], unique=False)
    op.create_index(op.f('ix_movie_title'), 'movie', ['title'], unique=False)
    op.create_index(op.f('ix_movie_year'), 'movie', ['year'], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_movie_year'), table_name='movie')
    op.drop_index(op.f('ix_movie_title'), table_name='movie')
    op.drop_index(op.f('ix_movie_id'), table_name='movie')
    op.drop_index(op.f('ix_movie_director'), table_name='movie')
    op.drop_index(op.f('ix_movie_country'), table_name='movie')
    op.drop_index(op.f('ix_movie_category'), table_name='movie')
    op.drop_table('movie')
    # ### end Alembic commands ###
