
// Establishing connection with server
var socket = io.connect();

function validatePin(pin){
    var pins = ['P9_33', 'P9_35', 'P9_36', 'P9_37', 'P9_38', 'P9_39', 'P9_40']
    var valid = false;
    for (p=0; p < pins.length; p++){
	if (pin == pins[p]){
	    valid = true;
	}
    }

    if (!valid){
	alert(pin + " is not a valid AIN pin!");
    }

    return valid;
}

// guess what
function addThermometer(){
    if (!validatePin(document.getElementById("pin").value)){
	return;
    }
    var json = '{';
    json +=  '"pin": "' + document.getElementById("pin").value;
    json +=  '", "name": "' + document.getElementById("name").value;
    json +=  '", "r_0": "' + document.getElementById("r-zero").value;
    json +=  '", "t_0": "' + document.getElementById("t-zero").value;
    json +=  '", "b": "' + document.getElementById("b-value").value;
    json +=  '", "r_ref": "' + document.getElementById("r-ref").value;
    json += '"}';
    socket.emit('addThermometer', json);
}

function addDefaultThermometer(name, pin, r_0, t_0, b, r_ref){
    validatePin(document.getElementById("pin").value);
    var json = '{';
    json +=  '"pin": "' + pin;
    json +=  '", "name": "' + name;
    json +=  '", "r_0": "' + r_0;
    json +=  '", "t_0": "' + t_0;
    json +=  '", "b": "' + b;
    json +=  '", "r_ref": "' + r_ref;
    json += '"}';
    socket.emit('addThermometer', json);
}

function removeThermometer(id){
    socket.emit('removeThermometer', '{"id": "'+ id + '"}');
    // not pretty but works should be done via callback
    document.getElementById(id).remove();    
}

function modifyThermometer(){
    if (!validatePin(document.getElementById("pin").value)){
	return;
    }

    var json = '{';
    json +=  '"pin": "' + document.getElementById("pin-mod").value;
    json +=  '", "name": "' + document.getElementById("name-mod").value;
    json +=  '", "r_0": "' + document.getElementById("r-zero-mod").value;
    json +=  '", "t_0": "' + document.getElementById("t-zero-mod").value;
    json +=  '", "b": "' + document.getElementById("b-value-mod").value;
    json +=  '", "r_ref": "' + document.getElementById("r-ref-mod").value;
    json += '"}';
    socket.emit('modifyThermometer', json);

    // needs two clicks
    document.getElementById("modify-button").onclick = function () {
        location.href = "/";
    };

}

function cancelModify() { 
    document.getElementById("modify").style.display = "none";
    document.getElementById("cancel-button").onclick = function () {
        location.href = "/";
    };
}

function displayModify(name, pin, t_0, r_0, b, r_ref) { 
    document.getElementById("modify").style.display = "block";

    document.getElementById("name-mod").setAttribute("value", name); 
    document.getElementById("pin-mod").setAttribute("value", pin);
    document.getElementById("t-zero-mod").setAttribute("value", t_0);
    document.getElementById("r-zero-mod").setAttribute("value", r_0);
    document.getElementById("b-value-mod").setAttribute("value", b);
    document.getElementById("r-ref-mod").setAttribute("value", r_ref);
}


socket.on('temperatures', function(temperatures) {

    var table = document.getElementById("table-temperature");

    for (t = 0; t < temperatures.length; t++) {		    

	if (document.getElementById(temperatures[t].id)){
	    var tr = document.getElementById(temperatures[t].id);
	    var tds = tr.childNodes;
            tds[0].childNodes[0].innerHTML = temperatures[t].name + " (" + temperatures[t].id + ")"
            tds[1].innerHTML = temperatures[t].temperature
        } else {
            var tr = document.createElement('TR');
	    tr.setAttribute("id", temperatures[t].id);

	    var a = document.createElement('a');
	    a.appendChild(document.createTextNode(temperatures[t].name + " (" + temperatures[t].id + ")"))

	    a.href = "#";
	    a.setAttribute("onclick", "displayModify('" + temperatures[t].name + "', '" + temperatures[t].id + "', '" + temperatures[t].t + "', '" + temperatures[t].r + "', '" + temperatures[t].b + "', '" + temperatures[t].ref + "')");

            var td = document.createElement('TD');
            td.appendChild(a);
            tr.appendChild(td);
	    
            var td = document.createElement('TD');
	    td.appendChild(document.createTextNode(temperatures[t].temperature));
            tr.appendChild(td);

	    var element = document.createElement("input");
	    element.type = "submit";
	    element.value = "del"
	    element.setAttribute("onclick", "removeThermometer('" + temperatures[t].id + "')");

            var td = document.createElement('TD');
	    td.appendChild(element);
            tr.appendChild(td);

            table.appendChild(tr);         
	}

    } // endfor

}); // end scoket.on


