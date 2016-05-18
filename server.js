//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var redis = require('redis');


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);
var rc = redis.createClient();

function convert_string_to_json_object(records){
  json_object = [];

  records.forEach(function (record) {
    json_object.push(JSON.parse(record));
  });

  return json_object;
}

function add_messages_to_redis(message){
  message_string = JSON.stringify(message);
  rc.rpush('messages', message_string, function(err, reply) {
    if (err){
      console.log("Error :" + err);
    }else{
      console.log("Success : " + reply);
    }
  });
}

function deliver_all_messages(socket){
  rc.lrange('messages', 0, -1, function(err, reply) {
    if (err){
      console.log("Error :" + err);
    }else{
      all_messages = convert_string_to_json_object(reply);
      send_all_old_messages_to_user(socket, all_messages);
    }
  });

}

function send_all_old_messages_to_user(socket, messages){
  messages.forEach(function (message) {
    socket.emit('message', message);
  });
}

app.use(express.static(path.resolve(__dirname, 'client')));
var sockets = [];

io.on('connection', function (socket) {
    deliver_all_messages(socket);

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        add_messages_to_redis(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
