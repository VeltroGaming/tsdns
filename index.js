let net = require('net');
let EventEmitter = require('events').EventEmitter;

const DEFAULT_PORT = 41144;
const TIMEOUT = 1000;

class TSDNS extends EventEmitter {
  constructor(port, host) {
    super();

    this.server = net.createServer().listen(port || DEFAULT_PORT, host);

    this.server.on('listening',  this.emit.bind(this, 'listening'));
    this.server.on('error',      this.emit.bind(this, 'error'));
    this.server.on('close',      this.emit.bind(this, 'close'));
    this.server.on('connection', this._onConnection.bind(this));
  }

  address() {
    return this.server.address();
  }

  close(cb) {
    this.on('close', cb);
    this.server.close();
  }

  _onConnection(socket) {
    socket.setEncoding('utf8');
    socket.setNoDelay(true);
    socket.setTimeout(TIMEOUT);
    socket.unref();

    socket.on('error',   this.emit.bind(this, 'socket-error',   socket));
    socket.on('close',   this.emit.bind(this, 'socket-close',   socket));
    socket.on('timeout', this.emit.bind(this, 'socket-timeout', socket));
    socket.on('timeout', _ => socket.destroy());

    socket.once('data', this.emit.bind('socket-data', socket));
    socket.once('data', this._onData.bind(this,       socket));
  }

  _onData(socket, data) {
    let responded = false;
    function respond(address, port) {
      if (responded) return;
      if (address && port) {
        socket.end(`${address}:${port}`);
      } else {
        socket.end('404');
      }
      responded = true;
    }

    this.emit('request',
      data.toLowerCase(), respond,
      socket.remoteAddress, socket.remotePort,
      socket
    );
  }
}

module.exports = TSDNS;
