# npm-route-r
Lite HTTP Request routing and serving framework for Node

# Usage
**Handle GET requests**
```js
var server = require("route-r").server;

server.onGet("/something", function(req, res) {
  return {
    headers: {"Content-Type":"application/json"}
    data: {"key":"value"}
  };
});

server.start(9898);
```
**Extract path variables**
```js
//...
server.onGet("/user/:id", function(req, res) {
  var userId = req.params.id;
  //...
});
//...
```
**Extract query parameters**
```js
//...
server.onGet("/users/search", function(req, res) { //users/search?name=john&city=sf
  var name = req.params.name, // john
      city = req.params.city //sf
  //...
});
//...
```
**Handle POST requests**
```js
//...
server.onPost("/user/add", function(req, res) { 
  var user = req.body; // exctract JSON body (get JSON if req content-type is application/json)
  //...
});
//...
```
**Return any custom headers**
```js
//...
server.onGet("/users/list", function(req, res) { 
  return {
    headers: {"X-Served-By": "route-r"}
  };
  //...
});
//...
```
**Return custom error code and message**
```js
//...
server.onGet("/users/list", function(req, res) { 
  return {
    code: 401,  //Not authorized
    message: "No any valid token found" //custom message
  };
  //...
});
//...
```
**Force file download**
```js
//...
server.onGet("/users/list/download", function(req, res) { 
  return {
    downloadAs: "users-list.txt",
    data: "......"
  };
  //...
});
//...
```
