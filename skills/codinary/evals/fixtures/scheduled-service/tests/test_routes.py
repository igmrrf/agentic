import unittest
from unittest.mock import Mock

from routes import route_request


class RouteTests(unittest.TestCase):
    def test_old_client_contract(self):
        self.assertEqual(route_request("GET", "/v1/ping", Mock()), (200, {"status": "ok", "apiVersion": 1}))

    def test_unknown_resource(self):
        self.assertEqual(route_request("GET", "/missing", Mock()), (404, {"error": "Not found"}))
