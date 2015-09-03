var http = require('http');
var path = require('path');
var redis = require('redis');
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var redis_client = redis.createClient(); 

var sockets = {
  users: {},
  add_socket: function (user_id, socket) {
    this.users[user_id] = this.users[user_id] || [];
    this.users[user_id].push(socket);
  },
  remove_socket: function(user_id, socket) {
    if (this.users[user_id]) {
      for (var i = 0; i < this.users[user_id].length; i++) {
        if (this.users[user_id][i] === socket) {
          this.users[user_id].splice(i, 1);
          break;
        }
      };
    }
  },
  emit: function (users,notify,data) {
    if (this.users[users]) {
        this.users[users].forEach(function(socket) {
        socket.emit(notify,data);
      });
    }
  }
};
  
  redis_client.on("subscribe", function (channel, count) {});
    
  redis_client.on("message", function (channel, message) {
      sockets.emit('open_group','group_message',message);  //  console.log(message);
  });

  redis_client.subscribe("messages");

  io.on('connection', function (socket) {

    socket.on('connect_me', function (data) {
      sockets.add_socket(data.user_id,socket);
    });

    socket.on('release_me', function (data) {
      sockets.remove_socket(data.user_id,socket);
    });

    socket.on('join_group', function() {
      sockets.add_socket('open_group',socket);
    });

    socket.on('leave_group', function() {
      sockets.remove_socket('open_group',socket);
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
