var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var b = require('bonescript');

var debug = false;

// if it is befor / it works, i do not udnerstand why
app.get('/modify', function(req, res){
    res.sendFile(__dirname + '/modify.html');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var u_tot = 3.3;
var u_ref = 1.8;

function Thermometer (name, pin, t_0, r_0, b, r_ref) {
    this.name = name
    this.pin = pin;
    this.t_0 = parseFloat(t_0);
    this.r_0 = parseFloat(r_0);
    this.b = parseFloat(b);
    this.r_ref = parseFloat(r_ref);
}

Thermometer.prototype = {
    constructor: Thermometer,
    calc_voltage:function () {
	reading = b.analogRead(this.pin);
	voltage = reading * u_ref;
	if (debug){
	    console.log("AIN: " + reading);
	    console.log("voltage: " + voltage);
	}
	return voltage;
    },
    calc_resistance:function (u) {
	resistance = this.r_ref / (u_tot / u - 1);
	if (debug){
	    console.log("resistance: " + resistance);
	}
	return resistance;
    },
    calc_temperature:function (r) {
	temperature = 1. / parseFloat(1. / this.t_0 + 1. / this.b * Math.log(r / this.r_0));
	temperature -= 272;
	if (debug){
	    console.log("temperature: " + temperature);
	}
	return temperature
    },
    temperature:function () {
	u = this.calc_voltage();
	r = this.calc_resistance(u);
	t = this.calc_temperature(r);
	return Math.round(t * 10) / 10;	 
    }
}

function handleAddThermometer(data) {
    console.log("ADD");
    var values = JSON.parse(data);   
    console.log("name: " + values.name);
    console.log("pin: " + values.pin);
    console.log("t_0: " + values.t_0);
    console.log("r_0: " + values.r_0);
    console.log("b: " + values.b);
    console.log("r_ref: " + values.r_ref);
    thermometers.push(new Thermometer(values.name, values.pin, parseInt(values.t_0), parseInt(values.r_0), parseInt(values.b), parseInt(values.r_ref)));
}

function handleModifyThermometer(data) {
    console.log("MODIFY");
    var values = JSON.parse(data);   
    console.log("name: " + values.name);
    console.log("pin: " + values.pin);
    console.log("t_0: " + values.t_0);
    console.log("r_0: " + values.r_0);
    console.log("b: " + values.b);
    console.log("r_ref: " + values.r_ref);

    var index;
    for (var t = 0; t < thermometers.length; t++) {
	if (thermometers[t].pin == values.pin){
	    index = t;
	}
    }
    if (index) {	
	console.log("index: " + index);
	thermometers[index].name = values.name;
	thermometers[index].t_0 = values.t_0;
	thermometers[index].r_0 = values.r_0;
	thermometers[index].b = values.b;
	thermometers[index].r_ref = values.r_ref;
    }
}

function handleRemoveThermometer(data) {
    console.log("REMOVE");
    var values = JSON.parse(data);   
    console.log("id: " + values.id);
    var index;
    for (var t = 0; t < thermometers.length; t++) {
	console.log("pins: " + thermometers[t].pin);
	if (thermometers[t].pin == values.id){
	    index = t;
	}
    }
    if (index) {
	console.log("index: " + index);
	thermometers.splice(index, 1);
    }
}

var thermometers = [];
//thermometers.push(new Thermometer('default', 'P9_40', 298, 4092, 100000, 100000));

io.on('connection', function (socket) {

    setInterval(function () {
	if (debug){
	    console.log(thermometers.length);
	}
	var temperatures = [];
	for (var t = 0; t < thermometers.length; t++) {
            temperatures.push({'id' : thermometers[t].pin, 'temperature': thermometers[t].temperature(), 'name': thermometers[t].name, 't': thermometers[t].t_0, 'r': thermometers[t].r_0, 'b': thermometers[t].b, 'ref': thermometers[t].r_ref});
	    if (debug){
		console.log(thermometers[t].pin + ", t: " + thermometers[t].temperature() + ", t_0: " + thermometers[t].t_0 + ", b: " + thermometers[t].b + ", r_0: " + thermometers[t].r_0 + ", r_ref: " + thermometers[t].r_ref);
	    }
	}
        io.emit('temperatures', temperatures);
    }, 1000);

    socket.on('addThermometer', handleAddThermometer);
    socket.on('removeThermometer', handleRemoveThermometer);
    socket.on('modifyThermometer', handleModifyThermometer);

});

http.listen(8888, function(){
    console.log('listening on *:8888');
});



