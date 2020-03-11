
const http = require('http');
const app = require('./app');

// node-angular is just an identifier we can rename it to any
const debug = require("debug")("node-angular");

  
  const onError = error => {
    if (error.syscall !== "listen") {
      throw error;
    }
    const bind = typeof port === "string" ? "pipe " + port : "port " + port;
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  };
  
  const onListening = () => {
    console.log("Listening on port " + port);
  };

const port = process.env.PORT || "3000";

// telling express our port
app.set('port', port);

// const server = http.createServer((req, res) => {
//     res.send("This is my first response");
// });
const server = http.createServer(app);

server.on("error", onError);
server.on("listening", onListening);

server.listen(port);