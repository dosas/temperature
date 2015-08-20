
// Establishing connection with server
var socket = io.connect();

// Changes the led state
function changeState(state){
    if (state==1){
        // Emit message changing the state to 1
        socket.emit('changeState', '{"state":1}');
        // Change led status on web page to ON
        document.getElementById("outputStatus").innerHTML = "Status: ON";
    }
    else if (state==0){
        // Emit message changing the state to 0
        socket.emit('changeState', '{"state":0}');
        // Change led status on web page to OFF
        document.getElementById("outputStatus").innerHTML = "Status: OFF";
    }
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


