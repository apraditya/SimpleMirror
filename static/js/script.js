/* Author: 

*/

function removeMonitoringSessionDiv(boxId) {
	$('#boxes').children('#box-' + boxId).fadeOut(2000);
}

function resetCountdown(boxId, idleTime) {
	$('#'+boxID+ ' .hasCountdown').countdown('change', { until: idleTime} );
}

var json = JSON.stringify;

// Create a form for client and monitoring page
jQuery.fn.formBuilder = function(randNo, socket) {
	boxID = 'box-'+randNo; 				// the ID for the session's div
	idleTime = '+5m';					// The idle time for the opening session
	idleRemoteTime = idleTime + '+20';	// Additional timeout for the monitored session in the 'All Clients' page

	// Create the session div and bare form
	div = $('<div>', { id: boxID, 'class': 'monitor' });
	form = $('<form>');
	
	// Basic params for the inputs
	textInputParams = { type: 'text', name: 'message'};
	checkboxParams = { type: 'checkbox', name: 'tick'};
	
	// Construct a session div on client browser
	if (socket && socket.connected ) {
		// Setup an event listender onKeyup for the text input
		textInputParams['keyup'] = function() {
			// Send message to server through socket about the event
			socket.send(json(
				{
					randNo: randNo
					,type: 'text'
					,value: $(this).attr('value')
					,log: 'Form ' + randNo + ' is typing the message'
				})
			);
			
			// Reset the countdown idle time on the client
			resetCountdown(boxID, idleTime);
		};
		
		// Setup an event listener onClick for the checkbox
		checkboxParams['click'] = function() {
			// Send message to server through socket about the event
			socket.send(json(
				{
					randNo: randNo
					,type: 'checkbox'
					,status: $(this).attr('checked')
					,log: 'Form ' + randNo + ' checkbox is clicked' 
				})
			);
			
			// Reset the countdown idle time on the client
			resetCountdown(boxID, idleTime);
		};
		
		// Insert the title and timeout to the session div
		$('<h3>', {innerHTML: 'Your Session: '+ randNo}).appendTo(div);
		timeOutDiv = $('<div>', {innerHTML: 'This session will end in <br />'}).appendTo(div);
		$('<span>').countdown(
			{
				until: idleTime
				,format: 'MS'
				// Set a callback function once the time's up
				,onExpiry: function() {
					// Send a message to the server to remove the expired session div on the 'All Clients' page
					socket.send(json(
						{
							randNo: randNo
							,event: 'close box'
							,log: 'session ' + randNo + ' has reached its idle time on ' + new Date()
						})
					);
					
					// Fade out the countdown & remove the form
					$('#' + boxID + ' div').fadeOut(1000);
					$('#' + boxID + ' form').remove();
					
					// Put expiry notification message & show the start button
					$('<span>', {innerHTML: 'This session has expired'}).hide().appendTo($('#' + boxID)).fadeIn(2000);
					$('#appbox form').fadeIn(2000);
				}
			}
		).appendTo(timeOutDiv);
	} else { // Construct a session div for the 'All Clients' page
		// Insert the title and internal timeout to the monitored session
		$('<h3>', {innerHTML: 'Session: ' + randNo}).appendTo(div);
		$('<span>').countdown(
			{
				until: idleRemoteTime
				,format: 'MS'
				,onExpiry: function() {
					removeMonitoringSessionDiv(randNo);
				}
			}
		).hide().appendTo(div);
		
	}
	
	// Building the form for the session div
	$('<input>', textInputParams).appendTo(form);
	$('<br>').appendTo(form);
	$('<input>', checkboxParams).appendTo(form);
	
	// Building the session box
	form.appendTo(div);
	
	return div;

}; // End of jQuery.fn.formBuilder



$(document).ready(function() {   
   
	// Setup the socket.io client
   io.setPath('/client/');
   socket = new io.Socket(null, { 
     port: 8081
     ,transports: ['websocket', 'htmlfile', 'xhr-multipart', 'xhr-polling']
   });
   socket.connect();
   
   
   // HANDLING MESSAGES RECEIVED THROUGH SOCKET.IO
   socket.on('message', function(data){
	   // Convert Stringify json back to json object
	   data = eval("("+data+")");
	   
	   // If the sent message has specific event
	   if (data.event) {
		   switch(data.event) {
		   case 'create box':
			   monitorBox = $('<div>').formBuilder(data.randNo);
			   monitorBox.hide().prependTo($('#boxes')).fadeIn(2000);
			   break;
			   
		   case 'close box':
			   removeMonitoringSessionDiv(data.randNo);
			   break;
			   
		   default: // Do nothing, just to prevent error
		   }
		   
	   }
	   else {
		   // If the data contain a session number and an input type
		   if (data.randNo && data.type) {
			   remoteInput = $('#box-' + data.randNo + ' input:'+ data.type);
			   
			   // Update the input status and value based on the type
			   switch(data.type) {
			   case 'text':
				   remoteInput.attr('value', data.value);
				   break;
			   case 'checkbox':
				   remoteInput.attr('checked', data.status);
				   break;
			   }
			   
		   }
	   }
	   
	   // Write the message log (if any) to the log box
	   if (data.log) {
		   $('#receiver').append('<li>' + data["log"] + '</li>');
	   }
       
   });
   // END OF HANDLING MESSAGES RECEIVED 
   
   // 'start session' button
   $('#appbox form').bind('submit', function() {
	   // Generate a random session number
	   randNo = Math.floor(Math.random()*1000);
	   // Send a message to the server to create a session div at the monitoring page
	   socket.send(json({
		    randNo: randNo
		    ,event: 'create box'
		    ,log: 'New session just started: ' + randNo + ' on ' + new Date()
	   }));
	   
	   // Construct a form to play with
	   div = $(this).formBuilder(randNo, socket);
	   div.hide().appendTo($('#sessions')).fadeIn(3000);
	   
	   // Hide the 'start session' button
	   $(this).fadeOut(1000);
	   
	   return false;
   });
      
 });

