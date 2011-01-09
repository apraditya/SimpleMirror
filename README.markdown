# Introduction
This application makes use of [Socket.IO](http://github.com/LearnBoost/Socket.IO) to create a small interactive client-server application that communicates via websocket where user can have a page session (currently it's a form) such that: 

- a tick of a checkbox on the client end will correspond as an update of a tick on the server end, 
- or something typed into a text box on a client session will reflect in real time on a server. 

The server program is be able to receive from multiple sessions at once. A monitor page is created to visualize what is happening in the corresponding server. It contains the communication log and connected user sessions.

# Requirements
To run this application, you need to install [Node.js](http://github.com/ry/node). Also, if you're cloning / downloading from github, make sure you clone the SimpleMirror repository with git clone --recursive to get the socket.io submodule. Otherwise, you're good to go.

# Instruction
Once Node.js installed, run
    
    node server.js
    
in the application directory. Go to (http://0.0.0.0:8081), click the button to start a client session, or click **'All connected clients'** link to view the monitor page.
