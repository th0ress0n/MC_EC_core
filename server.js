'use strict';

var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const RabbitMQ = require('rabbitmq-node');

var routing = require('./common/routing');
var queues = require('./common/queues');

const HOST = '0.0.0.0';
var PORT = process.env.PORT || 8080;
server.listen(PORT);

app.use("/css", express.static(__dirname + '/css'));
app.use("/lib", express.static(__dirname + '/lib'));
app.use("/img", express.static(__dirname + '/img'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('init', { message: 'client init' });
  
  socket.on('init_callback', function (data) {
    console.log(data);
  });

});

var rabbitmq = new RabbitMQ('amqp://0.0.0.0');

rabbitmq.on('message', function(channel, message) {
  console.log("Core : channel: "+channel+" -> Message: "+message.toString());
  io.sockets.volatile.emit('add_message', { message: message.toString() } );
  rabbitmq.publish(queues.XPKIT_ANALYTICS, {message: 'Core received '+message.toString()+' on channel '+channel.toString()});
});

rabbitmq.on('error', function(err) {
  console.error(err);
});

rabbitmq.on('logs', function(print_log) {
  console.info(print_log);
});


function intervalFunc() {
  console.log("interval tick ");
  io.sockets.volatile.emit('add_message', { message: "Interval tick" } );
  rabbitmq.publish(queues.SCREEN_CORE, {message: 'tick'});
}

setInterval(intervalFunc, 2000);

rabbitmq.subscribe(queues.SCREEN_KNOWLEDGE);
rabbitmq.subscribe(queues.SCREEN_COMMUNITY);
rabbitmq.subscribe(queues.SCREEN_LIFE);
rabbitmq.subscribe(queues.SCREEN_FUTURE);
rabbitmq.subscribe(queues.XPKIT_ANALYTICS);
rabbitmq.subscribe(queues.SCREEN_CORE);
rabbitmq.publish(queues.SCREEN_CORE, {message: 'Kicking things off......->'});


