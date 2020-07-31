#!/usr/bin/python

import SimpleHTTPServer
import SocketServer
import os
import time
import thread

class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith('/kill_server'):
            print ("Server is going down, run it again manually!")
            def kill_me_please(server):
                server.shutdown()
            thread.start_new_thread(kill_me_please, (httpd,))
            self.send_error(500)

class MyTCPServer(SocketServer.TCPServer):
    def server_bind(self):
        import socket
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)

port = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print ("Current working directory %s" % os.getcwd())
print ("Serving HTTP on 0.0.0.0 port %s ..." % port)

server_address = ('', port)
httpd = MyTCPServer(server_address, MyHandler)
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass
httpd.server_close()

#CODE FROM: https://stackoverflow.com/questions/10085996/shutdown-socketserver-serve-forever-in-one-thread-python-application
