/**
 * Test suite data used by Spec, exported as suite
 */
exports.suite = {
    describe: "onDelete Test Suite",
    port: 9898,
    tests: [{
        describe: "should process DELETE request",
        routes: [{
            path: "/test/path",
            handler: function() {}
        }],
        request: {
            url: "http://localhost:9898/test/path"
        },
        expectation: {
            statusCode: 501
        }
    }, {
        describe: "should return correct response statusCode",
        routes: [{
            path: "/test/path",
            handler: function() {
                return { /*code: 200*/ };
            }
        }],
        request: {
            url: "http://localhost:9898/test/path"
        },
        expectation: {
            statusCode: 200
        }
    }, {
        describe: "should return valid response headers",
        routes: [{
            path: "/test/path",
            handler: function() {
                return {
                    headers: {
                        "X-Served-By": "Route-R"
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/test/path"
        },
        expectation: {
            statusCode: 200,
            headers: {
                "X-Served-By": "Route-R"
            }
        }
    }, {
        describe: "should return valid response data",
        routes: [{
            path: "/user/name",
            handler: function() {
                return {
                    data: {
                        "deleted": "true"
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/user/name"
        },
        expectation: {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                "deleted": "true"
            }
        }
    }, {
        describe: "should return 404 when no route defined",
        request: {
            url: "http://localhost:9898/user/name"
        },
        expectation: {
            statusCode: 404
        }
    }, {
        describe: "should reject POST request",
        routes: [{
            path: "/user/add",
            handler: function() {
                return {
                    data: {
                        "User": "added"
                    }
                };
            }
        }],
        request: {
            method: "post",
            url: "http://localhost:9898/user/add"
        },
        expectation: {
            statusCode: 404
        }
    }, {
        describe: "should reject GET request",
        routes: [{
            path: "/user/add",
            handler: function() {
                return {
                    data: {
                        "User": "added"
                    }
                };
            }
        }],
        request: {
            method: "get",
            url: "http://localhost:9898/user/add"
        },
        expectation: {
            statusCode: 404
        }
    }, {
        describe: "should reject unmatched path with 404",
        routes: [{
            path: "/users/list",
            handler: function() {
                return {
                    data: {
                        users: []
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/users/list1"
        },
        expectation: {
            statusCode: 404
        }
    }, {
        describe: "should reject unmatched path with 404",
        routes: [{
            path: "/users/list1",
            handler: function() {
                return {
                    data: {
                        users: []
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/users/list"
        },
        expectation: {
            statusCode: 404
        }
    }, {
        describe: "should reject unmatched path with 404",
        routes: [{
            path: "/users/list",
            handler: function() {
                return {
                    data: {
                        users: []
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/ausers/list"
        },
        expectation: {
            statusCode: 404
        }
    }, {
        describe: "should extract path variable",
        routes: [{
            path: "/user/:user/view",
            handler: function(req) {
                return {
                    data: {
                        user: req.params.user
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/user/rpatil26/view"
        },
        expectation: {
            statusCode: 200,
            data: {
                "user": "rpatil26"
            }
        }
    }, {
        describe: "should extract multiple path variables",
        routes: [{
            path: "/user/:country/:user/view",
            handler: function(req) {
                return {
                    data: {
                        user: req.params.user,
                        country: req.params.country
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/user/in/rpatil26/view"
        },
        expectation: {
            statusCode: 200,
            data: {
                user: "rpatil26",
                country: "in"
            }
        }
    }, {
        describe: "should extract query parameters",
        routes: [{
            path: "/users/search",
            handler: function(req) {
                return {
                    data: {
                        user: req.params.user,
                        country: req.params.country
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/users/search?country=in&user=rpatil26"
        },
        expectation: {
            statusCode: 200,
            data: {
                user: "rpatil26",
                country: "in"
            }
        }
    }, {
        describe: "should extract path variables and query parameters at the same time",
        routes: [{
            path: "/users/:country/search",
            handler: function(req) {
                return {
                    data: {
                        user: req.params.user,
                        country: req.params.country
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/users/in/search?user=rpatil26"
        },
        expectation: {
            statusCode: 200,
            data: {
                user: "rpatil26",
                country: "in"
            }
        }
    }, {
        describe: "should pick correct route when multiple routes are defined",
        routes: [{
            path: "/users/search",
            handler: function(req) {
                return {
                    data: {
                        isUserSearch: true
                    }
                };
            }
        }, {
            path: "/customer/search",
            handler: function(req) {
                return {
                    data: {
                        isCustomerSearch: true
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/customer/search"
        },
        expectation: {
            statusCode: 200,
            data: {
                isCustomerSearch: true
            }
        }
    }, {
        describe: "should pick correct route when multiple routes are defined",
        routes: [{
            path: "/users/search",
            handler: function(req) {
                return {
                    data: {
                        isUserSearch: true
                    }
                };
            }
        }, {
            path: "/customer/search",
            handler: function(req) {
                return {
                    data: {
                        isCustomerSearch: true
                    }
                };
            }
        }],
        request: {
            url: "http://localhost:9898/users/search"
        },
        expectation: {
            statusCode: 200,
            data: {
                isUserSearch: true
            }
        }
    }]
};
