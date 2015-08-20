
// Establishing connection with server
var socket = io.connect();

// guess what
function addThermometer(){
    // TODO: validate the input
    var json = '{';
    json +=  '"pin": "' + document.getElementById("pin").value;
    json +=  '", "r_0": "' + document.getElementById("r-zero").value;
    json +=  '", "t_0": "' + document.getElementById("t-zero").value;
    json +=  '", "b": "' + document.getElementById("b-value").value;
    json +=  '", "r_ref": "' + document.getElementById("r-ref").value;
    json += '"}';
    socket.emit('addThermometer', json);
}

socket.on('temperatures', function(temperatures) {

    var table = document.getElementById("table-temperature");

    for (t = 0; t < temperatures.length; t++) {		    

	if (document.getElementById(temperatures[t].id)){
	    var tr = document.getElementById(temperatures[t].id);
	    var tds = tr.childNodes;
            tds[0].innerHTML = temperatures[t].id
            tds[1].innerHTML = temperatures[t].temperature
        } else {
            var tr = document.createElement('TR');
	    tr.setAttribute("id", temperatures[t].id);				

            var td = document.createElement('TD');
            td.appendChild(document.createTextNode(temperatures[t].id));
            tr.appendChild(td);
	    
            var td = document.createElement('TD');
	    td.appendChild(document.createTextNode(temperatures[t].temperature));
            tr.appendChild(td);

            table.appendChild(tr);         
	}

    } // endfor

}); // end scoket.on


