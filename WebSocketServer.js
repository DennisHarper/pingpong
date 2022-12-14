const WebSocket = require('ws');

/*
  Class which provides functionality to create web sockets.
  This class basically acts as a wrapper around external libraries which provide socket capabilities
  Usage:
  constructor:
    var myServer = new WebSocketServer(httpServerObject, pingInterval, maxMissedHeartbeats)
    httpServerObject: An HTTP server object which the web socket would bind to
    pingInterval: Integer denoting the milliseconds at which a heartbeat would be sent to the client. Has a default value of 500.
    maxMissedHeartbeats: Integer denoting the number of heartbeats which, if the client does not respond to, it will be terminated. Has a default value of 10.

  getClients():
    Instance method to get a list of client ids, which are connected to the server currently.
*/
class WebSocketServer {
  constructor(httpsServer, pingInterval=500, maxMissedHeartbeats=10) {
    this.wss = new WebSocket.Server({
      server: httpsServer,
      clientTracking: true
    });
    this.wss.maxMissedHeartbeats = maxMissedHeartbeats;
    this.wss.on('connection', this._onConnection.bind(this));
    setInterval(function() {
      this._ping.bind(this);
      this._ping();
    }.bind(this), pingInterval);
  }

  getClients() {
    const clients = []
    this.wss.clients.forEach(function (client){
      clients.push(client.id);
    });
    return clients;
  }

  // Region: Private methods

  _onConnection(socket) {
    socket.id = this._getUniqueID();
    socket.notReceivedPong = 0;

    console.log(`${socket.id} connected successfully`)

    socket.on('message', function incoming(message) {
      if(message.toUpperCase() == "PONG") {
        socket.notReceivedPong = 0;
      }
    });

    socket.on('close', function close() {
      console.log(`Closing connection to client ${socket.id}`)
    })
  }

  _getUniqueID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
  }

  _ping() {
    this.wss.clients.forEach(function each(socket){
      if(socket.notReceivedPong == this.wss.maxMissedHeartbeats) {
        console.log(`Disconnecting client ${socket.id} as it has't responded with a pong since ${this.wss.maxMissedHeartbeats} heartbeats`);
        socket.terminate();
      } else {
        socket.send("PING");
        socket.notReceivedPong += 1;
      }
    }.bind(this));
  }
}

module.exports = WebSocketServer;
