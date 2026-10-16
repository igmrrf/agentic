import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from routes import route_request


class Handler(BaseHTTPRequestHandler):
    def handle_request(self):
        length = int(self.headers.get("Content-Length", "0"))
        content = self.rfile.read(length) if length else b""
        status, result = route_request(
            self.command,
            self.path,
            {"headers": self.headers, "body": content, "database": self.server.database},
        )
        encoded = json.dumps(result).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    do_GET = handle_request
    do_POST = handle_request


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=17808)
    parser.add_argument("--database", required=True)
    options = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", options.port), Handler)
    server.database = options.database
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
