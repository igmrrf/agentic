def route_request(method, path, context):
    if method == "GET" and path == "/v1/ping":
        return 200, {"status": "ok", "apiVersion": 1}
    if method == "GET" and path == "/health":
        return 200, {"ok": True}
    return 404, {"error": "Not found"}
