var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var b = require('bonescript');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    setInterval(function () {
        io.emit('temperature', {'temperature': '200'});
	console.log('did stuff');
    }, 2000);
    socket.on('changeState', handleChangeState);
});

http.listen(8888, function(){
    console.log('listening on *:8888');
});

function handleChangeState(data) {
    var newData = JSON.parse(data);
    console.log("Status: " + newData.state);
}