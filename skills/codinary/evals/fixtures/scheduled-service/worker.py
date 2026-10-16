import argparse
import json


def execute_due_jobs(database_path, now_seconds):
    return 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--database", required=True)
    parser.add_argument("--now-seconds", required=True, type=int)
    options = parser.parse_args()
    executed = execute_due_jobs(options.database, options.now_seconds)
    print(json.dumps({"executed": executed}))


if __name__ == "__main__":
    main()
