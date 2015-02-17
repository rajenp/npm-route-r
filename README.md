# npm-route-r
Lite HTTP Request routing and serving framework for Node

# Usage
```js
var server = require("route-r").server;

server.onGet("/something", function(req, res) {
  return {
    headers: {"Content-Type":"application/json"}
    code: 200,
    data: {"key":"value"}
  };
});

server.start(9898);
```
