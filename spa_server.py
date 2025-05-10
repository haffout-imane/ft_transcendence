from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer  # Changed import location
import os

class SPARouter(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.directory = os.path.join(os.path.dirname(__file__), 'dist')
        super().__init__(*args, directory=self.directory, **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/') or '.' in self.path.split('/')[-1]:
            return super().do_GET()
        self.path = 'index.html'
        return super().do_GET()

if __name__ == '__main__':
    with TCPServer(("", 8000), SPARouter) as httpd:
        print("SPA server running at http://localhost:8000")
        httpd.serve_forever()