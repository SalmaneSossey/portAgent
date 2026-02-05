"""Initial migration - create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-02-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    dossier_type = postgresql.ENUM('EI', 'LI', name='dossiertype', create_type=False)
    dossier_status = postgresql.ENUM('brouillon', 'en_cours', 'valide', 'soumis', 'rejete', name='dossierstatus', create_type=False)
    pipeline_status = postgresql.ENUM('pending', 'running', 'success', 'error', name='pipelinestatus', create_type=False)
    
    dossier_type.create(op.get_bind(), checkfirst=True)
    dossier_status.create(op.get_bind(), checkfirst=True)
    pipeline_status.create(op.get_bind(), checkfirst=True)
    
    # Dossiers table
    op.create_table('dossiers',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type_ti', sa.Enum('EI', 'LI', name='dossiertype'), nullable=True),
        sa.Column('status', sa.Enum('brouillon', 'en_cours', 'valide', 'soumis', 'rejete', name='dossierstatus'), nullable=True),
        sa.Column('reference', sa.String(length=50), nullable=True),
        sa.Column('importateur', sa.String(length=255), nullable=True),
        sa.Column('raison_sociale', sa.String(length=255), nullable=True),
        sa.Column('summary_json_readable', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Provenances table
    op.create_table('provenances',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pays', sa.String(length=100), nullable=False),
        sa.Column('code_pays', sa.String(length=3), nullable=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Factures table
    op.create_table('factures',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reference', sa.String(length=100), nullable=True),
        sa.Column('devise', sa.String(length=3), nullable=True),
        sa.Column('montant', sa.Float(), nullable=True),
        sa.Column('date_facture', sa.DateTime(), nullable=True),
        sa.Column('fournisseur', sa.String(length=255), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=True),
        sa.Column('extracted_data', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Documents table
    op.create_table('documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type_doc', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('date_document', sa.DateTime(), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Marchandises table
    op.create_table('marchandises',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('designation', sa.String(length=500), nullable=False),
        sa.Column('hs_code', sa.String(length=20), nullable=True),
        sa.Column('origine', sa.String(length=100), nullable=True),
        sa.Column('poids_net', sa.Float(), nullable=True),
        sa.Column('unite', sa.String(length=20), nullable=True),
        sa.Column('unite_complementaire', sa.String(length=50), nullable=True),
        sa.Column('quantite', sa.Float(), nullable=True),
        sa.Column('valeur', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Pipeline Events table
    op.create_table('pipeline_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dossier_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ts', sa.DateTime(), nullable=True),
        sa.Column('agent', sa.String(length=50), nullable=False),
        sa.Column('step', sa.String(length=100), nullable=True),
        sa.Column('status', sa.Enum('pending', 'running', 'success', 'error', name='pipelinestatus'), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('message_readable', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['dossier_id'], ['dossiers.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('pipeline_events')
    op.drop_table('marchandises')
    op.drop_table('documents')
    op.drop_table('factures')
    op.drop_table('provenances')
    op.drop_table('dossiers')
    
    # Drop enum types
    sa.Enum(name='pipelinestatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='dossierstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='dossiertype').drop(op.get_bind(), checkfirst=True)
