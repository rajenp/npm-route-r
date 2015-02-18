# npm-route-r
Lite HTTP Request routing and serving framework for Node

# Usage
**Example One**
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
**Example Two (Extract path parameters)**
```js
//...
server.onGet("/user/:id", function(req, res) {
  var userId = req.params.id;
  //...
});
//...
```
**Example Three (Extract query parameters)**
```js
//...
server.onGet("/users/search", function(req, res) { //users/search?name=john&city=sf
  var name = req.params.name, // john
      city = req.params.city //sf
  //...
});
//...
```
