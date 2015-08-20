var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var b = require('bonescript');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var u_tot = 3.3;
var u_ref = 1.8;

function Thermometer (pin, t_0, r_0, b, r_ref) {
    this.pin = pin;
    this.t_0 = t_0;
    this.r_0 = r_0;
    this.b = b;
    this.r_ref = r_ref;
}

Thermometer.prototype = {
    constructor: Thermometer,
    calc_voltage:function () {
	return b.analogRead(this.pin) * u_ref;
    },
    calc_resistance:function (u) {
	r = this.r_ref / (u_tot / u - 1);
	return r;
    },
    calc_temperature:function (r) {
	t = 1. / (1./this.t_0 + 1./this.b * Math.log(r/this.r_0));
	return t - 272;
    },
    temperature:function () {
	u = this.calc_voltage();
	r = this.calc_resistance(u);
	t = this.calc_temperature(r);
	return Math.round(t * 10) / 10;	 
    }
}

// just add new thermometers below (TODO: add these via webinterface)
var thermometers = [];
thermometers.push(new Thermometer('P9_40', 298, 4092, 100000, 100000));

io.on('connection', function (socket) {

    setInterval(function () {	
	var temperatures = [];
	for (var t = 0; t < thermometers.length; ++t) {
            temperatures.push({'id' : thermometers[t].pin, 'temperature': thermometers[t].temperature()});
	    //console.log(thermometers[t].pin + ": " + thermometers[t].temperature());
	}
        io.emit('temperatures', temperatures);
    }, 1000);

    socket.on('changeState', handleChangeState);

});

http.listen(8888, function(){
    console.log('listening on *:8888');
});

function handleChangeState(data) {
    var newData = JSON.parse(data);
    console.log("Status: " + newData.state);
}

