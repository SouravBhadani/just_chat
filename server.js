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



//pub_sub example
var sockets = {
  users: {},
  add_socket: function (user_id, socket) {
    this.users[user_id] = this.users[user_id] || [];
    this.users[user_id].push(socket);
   console.log(this.users[user_id].length);
  },
  remove_socket: function(user_id, socket) {
    if (this.users[user_id]) {
      for (var i = 0; i < this.users[user_id].length; i++) {
        if (this.users[user_id][i] === socket) {
          this.users[user_id].splice(i, 1);
         console.log("remove" + this.users[user_id].length);
          break;
        }
      };
    }
  },
  emit: function (eventName, data) {
    if (this.users[eventName]) {
      this.users[eventName].forEach(function(fn) {
        fn(data);
      });
    }
  }
};
  
  redis_client.on("subscribe", function (channel, count) {
       
    });
 
    redis_client.on("message", function (channel, message) {
         console.log(message);
    });
 

    redis_client.on('connect', function() {
      console.log('connected');
    });

   redis_client.subscribe("messages");

  

  io.on('connection', function (socket) {

    socket.on('connect_me', function (data) {
      sockets.add_socket(data.user_id,socket);
    });

    socket.on('release_me', function (data) {
      sockets.remove_socket(data.user_id,socket);
    });

    socket.on('message', function (data) {
      console.log(data);
    });

  });


  

  // io.on('connection', function (socket) {
    
  //   messages.forEach(function (data) {
  //     socket.emit('message', data);
  //   });


  //   redis_client.sadd('unknown',socket.id , function(err, reply) {
  //     console.log(reply); // 3
  //   });
    
  //   socket.on('connect_me', function (data) {
  //     sockets.add_socket(data.user_id,socket);
  //     console.log(data);
  //   });

  //   socket.on('release_me', function (data) {
  //     sockets.remove_socket(data.user_id,socket);
  //     console.log(data);
  //   });

    


    // sockets.push(socket);
    // socket.on('disconnect', function () {
    //   sockets.remove_socket(data.user_id,socket)
    //   sockets.splice(sockets.indexOf(socket), 1);
    //  // updateRoster();
    // });

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

  //   socket.on('identify', function (name) {
  //     // socket.set('name', String(name || 'Anonymous'), function (err) {
  //     //   updateRoster();
  //     // });
  //   });
  // });

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
