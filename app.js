var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var b = require('bonescript');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var u_tot = 3.3;
var u_ref = 1.8;

function Thermometer (name, pin, t_0, r_0, b, r_ref) {
    this.name = name
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

function handleAddThermometer(data) {
    var values = JSON.parse(data);   
    console.log("name: " + values.name);
    console.log("pin: " + values.pin);
    console.log("t_0: " + values.t_0);
    console.log("r_0: " + values.r_0);
    console.log("b: " + values.b);
    console.log("r_ref: " + values.r_ref);
    thermometers.push(new Thermometer(values.name, values.pin, parseInt(values.t_0), parseInt(values.b), parseInt(values.r_0), parseInt(values.r_ref)));
}

function handleRemoveThermometer(data) {
    var values = JSON.parse(data);   
    var index;
    for (var t = 0; t < thermometers.length; ++t) {
	if (thermometers[t].pin == values.id){
	    index = t;
	}
    }
    if (index) {
	thermometers.splice(index, 1);
    }
}

// just add new thermometers below
var thermometers = [];
thermometers.push(new Thermometer('default', 'P9_40', 298, 4092, 100000, 100000));

io.on('connection', function (socket) {

    setInterval(function () {
	console.log(thermometers.length)
	var temperatures = [];
	for (var t = 0; t < thermometers.length; ++t) {
            temperatures.push({'id' : thermometers[t].pin, 'temperature': thermometers[t].temperature(), 'name': thermometers[t].name});
	    //console.log(thermometers[t].pin + ": " + thermometers[t].temperature());
	}
        io.emit('temperatures', temperatures);
    }, 1000);

    socket.on('addThermometer', handleAddThermometer);
    socket.on('removeThermometer', handleRemoveThermometer);

});

http.listen(8888, function(){
    console.log('listening on *:8888');
});



