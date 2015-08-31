//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');
var redis = require('redis');
var redis_client = redis.createClient(); //creates a new client
var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];


//pub_sub example
var pub_sub = {
  events: {},
  add_socket: function (user_id, socket) {
    this.events[user_id] = this.events[user_id] || [];
    this.events[user_id].push(socket);
  },
  remove_socket: function(user_id, socket) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      };
    }
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function(fn) {
        fn(data);
      });
    }
  }
};





  redis_client.on('connect', function() {
      console.log('connected');
  });

  io.on('connection', function (socket) {
    
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    redis_client.sadd('unknown',socket.id , function(err, reply) {
      console.log(reply); // 3
    });
    
    socket.on('connect_me', function (data) {
      console.log(data);
    });


    sockets.push(socket);
    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
     // updateRoster();
    });

    // socket.on('message', function (msg) {
    //   var text = String(msg || '');

    //   if (!text)
    //     return;

    //   // socket.get('name', function (err, name) {
    //   //   var data = {
    //   //     name: name,
    //   //     text: text
    //   //   };

    //   //   broadcast('message', data);
    //   //   messages.push(data);
    //   // });
    // });

    socket.on('identify', function (name) {
      // socket.set('name', String(name || 'Anonymous'), function (err) {
      //   updateRoster();
      // });
    });
  });

// function updateRoster() {
//   async.map(
//     sockets,
//     function (socket, callback) {
//       socket.get('name', callback);
//     },
//     function (err, names) {
//       broadcast('roster', names);
//     }
//   );
// }

// function broadcast(event, data) {
//   sockets.forEach(function (socket) {
//     socket.emit(event, data);
//   });
// }

server.listen(process.env.PORT || 5000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
