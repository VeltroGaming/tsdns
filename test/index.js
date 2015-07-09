let TSDNS = require('../');

let tsdns = new TSDNS(/* port = 41144, host = all interfaces */);

tsdns.on('listening',       () => console.log('listening'));
tsdns.on('error',     error    => console.log('server error')); // port already in use?
tsdns.on('close',     hadError => console.log('closed'));

tsdns.on('socket-error',  (socket, error)    => console.log('socket error', error));
tsdns.on('socket-close',  (socket, hadError) => console.log('socket closed', hadError));
tsdns.on('socket-timeout', socket            => console.log('socket timeout'));
tsdns.on('socket-data',   (socket, data)     => console.log('raw socket data', data));

tsdns.on('request', (req, respond, address, port, socket) => {
  console.log(`${address}:${port} requested "${req}"`);

  // respond with a TeamSpeak 3 Server address
  respond('127.0.0.1', 9987);

  // or send a 404
  respond(false);
});
