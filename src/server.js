/*
 * Copyright 2015 Rajendra Patil
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Configurable Server to map requests to handlers
 * @author Rajendra Patil
 */
(function() {

    "use strict";

    var http = require("http"),
        querystring = require("querystring"),
        URLParser = {
            parse: function(url, routePath) {
                var paramNames = [],
                    query,
                    params = {},
                    tokens,
                    qTokens,
                    route,
                    match,
                    qIndex = url.indexOf("?");
                if (qIndex > 0) {
                    query = url.substring(qIndex + 1);
                    url = url.substring(0, qIndex);
                    params = querystring.parse(query);
                }
                route = routePath.replace(/\/\:([^\:\/]+)/img, function() {
                    paramNames.push(arguments[1]);
                    return "/([^\/]+)";
                });
                route += "$";
                match = url.match(route);
                if (match) {
                    match.shift();
                    match.forEach(function(value) {
                        params[paramNames.shift()] = value;
                    });
                    return params;
                }
            }
        },
        tasks = {},
        resultWithCode = function(code) {
            return {
                code: code
            };
        },
        getDefaultRoutes = function() {
            return {
                on: [],
                get: [],
                put: [],
                post: [],
                "delete": [],
                options: [],
                head: [],
                trace: [],
                connect: []
            };
        },
        routes = getDefaultRoutes(),
        helper = {
            onRequestBody: function(req, callback) {
                var fullBody = "",
                    data,
                    contentType;
                req.on("data", function(chunk) {
                    fullBody += chunk.toString();

                });
                req.on("end", function() {
                    contentType = req.headers["content-type"] || req.headers["Content-Type"];
                    if (fullBody && contentType === "application/json") {
                        data = JSON.parse(fullBody);
                    } else {
                        data = fullBody;
                    }
                    callback({
                        data: data
                    });
                });
            },
            sendJSON: function(res, anObject) {
                res.write(JSON.stringify(anObject));
                res.end();
            },
            sendResult: function(res, result) {
                result = result || resultWithCode(404);
                result.code = result.code || 200; // Assume OK 
                result.message = result.message || http.STATUS_CODES[result.code];
                if (result.data && typeof result.data === "object") {
                    res.setHeader("Content-Type", "application/json");
                }
                if (result.downloadAs) {
                    result.data = result.data.toString();
                    res.setHeader("Content-Type", "application/octet-stream");
                    res.setHeader("Content-Disposition", "attachment; filename=\"" + result.downloadAs + "\"");
                }
                res.writeHead(result.code, result.message, result.headers || {});
                if (!result.data) {
                    res.end();
                } else {
                    if (typeof result.data === "object") {
                        helper.sendJSON(res, result.data);
                    } else {
                        res.write(result.data);
                        res.end();
                    }
                }
            },
            resetRoutes: function() {
                routes = getDefaultRoutes();
            }
        },
        server = (function() {
            var httpServer,
                processReq = function(req, res) {
                    console.log("%s - \"%s %s HTTP/%s\"",
                        req.connection.remoteAddress,
                        req.method,
                        req.url,
                        req.httpVersion);
                    var index = 0,
                        definedRoutes = routes[req.method.toLowerCase()], //find the routes for the given method
                        length = definedRoutes.length,
                        route,
                        result = resultWithCode(404),
                        params,
                        callback = function(body) {
                            req.body = body.data; //inject body
                            result = route.handler(req, res);
                            result = result || resultWithCode(501);
                            helper.sendResult(res, result);
                        };
                    if (definedRoutes.length < 1) { //if method specific routes are not defined, fallback
                        definedRoutes = routes.on;
                        length = definedRoutes.length;
                    }
                    //start matching routes in order and start serving, first matching route will serve the request
                    while (index < length) {
                        route = definedRoutes[index];
                        params = URLParser.parse(req.url, route.path);
                        if (params) { //this url matches the route
                            req.params = params; //inject path params
                            console.log("Route: ", route.path);
                            if (req.method === "POST" || req.method === "PUT") {
                                helper.onRequestBody(req, callback);
                                return;
                            }
                            callback({});
                            return;
                        }
                        index += 1;
                    }
                    helper.sendResult(res, result);
                },
                addRoute = function(key, route) {
                    var list = routes[key];
                    if (list) {
                        list.push(route);
                    }
                };


            return {
                on: function(routePath, callback) {
                    addRoute("on", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                onGet: function(routePath, callback) {
                    addRoute("get", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                onPut: function(routePath, callback) {
                    addRoute("put", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                onDelete: function(routePath, callback) {
                    addRoute("delete", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                onPost: function(routePath, callback) {
                    addRoute("post", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                onOptions: function(routePath, callback) {
                    addRoute("options", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                onHead: function(routePath, callback) {
                    addRoute("head", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                onTrace: function(routePath, callback) {
                    addRoute("trace", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                onConnect: function(routePath, callback) {
                    addRoute("connect", {
                        path: routePath,
                        handler: callback
                    });
                    return this;
                },
                start: function(port) {
                    if (!port || typeof port !== "number") {
                        throw new Error("Invalid port number: " + port);
                    }
                    httpServer = http.createServer(processReq).listen(port);
                },
                stop: function(callback) {
                    if (httpServer) {
                        httpServer.close(callback);
                    }
                    helper.resetRoutes();
                }
            };
        }());
    exports.server = server;
}(exports));
