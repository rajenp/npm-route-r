/*
 * Copyright 2015 Rajendra Patil
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Configurable Server to map requests to handlers
 * @author Rajendra Patil
 */

"use strict";

var http = require("http"),
    querystring = require("querystring"),
    URLParser = {
        parse: function (url, routePath) {
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
            route = routePath.replace(/\/\:([^\:\/]+)/img, function () {
                paramNames.push(arguments[1]);
                return "/([^\/]+)";
            });
            route += "$";
            match = url.match(route);
            if (match) {
                match.shift();
                match.forEach(function (value) {
                    params[paramNames.shift()] = value;
                });
                return params;
            }
        }
    },
    tasks = {},
    resultWithCode = function (code) {
        return {
            code: code
        };
    },
    routes = {
        on: [],
        get: [],
        put: [],
        post: [],
        "delete": [],
        options: [],
        head: [],
        trace: [],
        connect: []
    },
    helper = {
        onRequestBody: function (req, callback) {
            var fullBody = "",
                data;
            req.on("data", function (chunk) {
                fullBody += chunk.toString();

            });
            req.on("end", function () {
                data = fullBody && JSON.parse(fullBody);

                callback({
                    data: data
                });
            });
        },
        sendJSON: function (res, anObject) {
            res.write(JSON.stringify(anObject));
            res.end();
        },
        sendResult: function (res, result) {
            result = result || resultWithCode(404);
            result.message = result.message || http.STATUS_CODES[result.code];
            if (result.data && typeof result.data === "object") {
                res.setHeader("Content-Type", "application/json");
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
        }
    },
    server = (function () {
        var processReq = function (req, res) {
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
                    callback = function (body) {
                        req.body = body.data; //inject body
                        result = route.handler(req, res);
                        result = result || resultWithCode(501);
                        helper.sendResult(res, result);
                    };
                if (definedRoutes.length < 1) { //if method specific routes are not defined, fallback
                    definedRoutes = routes.on;
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
            addRoute = function (key, route) {
                var list = routes[key];
                list && list.push(route);
            };
        return {
            on: function (routePath, callback) {
                addRoute("on", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            onGet: function (routePath, callback) {
                addRoute("get", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            onPut: function (routePath, callback) {
                addRoute("put", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            onDelete: function (routePath, callback) {
                addRoute("delete", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            onPost: function (routePath, callback) {
                addRoute("post", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            onOptions: function (routePath, callback) {
                addRoute("options", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            onHead: function (routePath, callback) {
                addRoute("head", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            onTrace: function (routePath, callback) {
                addRoute("trace", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            onConnect: function (routePath, callback) {
                addRoute("connect", {
                    path: routePath,
                    handler: callback
                });
                return this;
            },
            start: function (port) {
                if (!port || typeof port !== "number") {
                    throw new Error("Invalid port number: " + port);
                }
                http.createServer(processReq).listen(port);
            }
        }
    }());
exports.server = server;
