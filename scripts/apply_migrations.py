"""
Applies any not-yet-applied .sql file in supabase/migrations/, in filename
order, tracking what's been applied in a `_migrations_applied` table so
re-running this script is a no-op for migrations already run.

Usage: DATABASE_URL=postgresql://... python scripts/apply_migrations.py
The connection string (with the real DB password) is read from the
environment only - never hardcoded or written to a file.
"""

import os
import sys
from pathlib import Path

import psycopg

MIGRATIONS_DIR = Path(__file__).parent.parent / "supabase" / "migrations"


def main():
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        sys.exit("Set DATABASE_URL to the Supabase Postgres connection string first.")

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        sys.exit(f"No .sql files found in {MIGRATIONS_DIR}")

    with psycopg.connect(database_url, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "create table if not exists _migrations_applied "
                "(filename text primary key, applied_at timestamptz default now())"
            )
            cur.execute("select filename from _migrations_applied")
            already_applied = {row[0] for row in cur.fetchall()}

        for migration_file in migration_files:
            if migration_file.name in already_applied:
                print(f"skip (already applied): {migration_file.name}")
                continue

            print(f"applying: {migration_file.name}")
            sql = migration_file.read_text(encoding="utf-8")
            with conn.cursor() as cur:
                cur.execute(sql)
                cur.execute(
                    "insert into _migrations_applied (filename) values (%s)",
                    (migration_file.name,),
                )
            conn.commit()
            print(f"applied: {migration_file.name}")


if __name__ == "__main__":
    main()
