from __future__ import with_statement

import logging
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app import app  # Ensure this is the correct import for your Flask app

environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

logger = logging.getLogger('alembic.env')

with app.app_context():
    from flask import current_app
    config.set_main_option(
        'sqlalchemy.url',
        str(current_app.extensions['migrate'].db.engine.url).replace('%', '%%')
    )
    target_metadata = current_app.extensions['migrate'].db.metadata

    def run_migrations_offline():
        """Run migrations in 'offline' mode."""
        url = config.get_main_option("sqlalchemy.url")
        context.configure(
            url=url, target_metadata=target_metadata, literal_binds=True
        )

        with context.begin_transaction():
            context.run_migrations()

    def run_migrations_online():
        """Run migrations in 'online' mode."""

        def process_revision_directives(context, revision, directives):
            if getattr(config.cmd_opts, 'autogenerate', False):
                script = directives[0]
                if script.upgrade_ops.is_empty():
                    directives[:] = []
                    logger.info('No changes in schema detected.')

        connectable = engine_from_config(
            config.get_section(config.config_ini_section),
            prefix='sqlalchemy.',
            poolclass=pool.NullPool,
        )

        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                process_revision_directives=process_revision_directives,
                **current_app.extensions['migrate'].configure_args
            )
            # Create a schema (only in production)
            if environment == "production":
                connection.execute(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA}")

            # Set search path to your schema (only in production)
            with context.begin_transaction():
                if environment == "production":
                    context.execute(f"SET search_path TO {SCHEMA}")
                context.run_migrations()

    if context.is_offline_mode():
        run_migrations_offline()
    else:
        run_migrations_online()
