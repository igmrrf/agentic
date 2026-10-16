import sqlite3
import sys


def migrate(database_path):
    with sqlite3.connect(database_path) as connection:
        connection.execute("CREATE TABLE IF NOT EXISTS legacy_metadata (name TEXT PRIMARY KEY, value TEXT NOT NULL)")
        connection.execute("INSERT OR IGNORE INTO legacy_metadata VALUES (?, ?)", ("sentinel", "preserve-me"))


if __name__ == "__main__":
    migrate(sys.argv[1])
