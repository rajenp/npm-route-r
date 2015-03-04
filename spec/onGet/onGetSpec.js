var suite = require('./onGetSuite.js').suite;

describe(suite.describe, function() {

    var SERVER_FILE_PATH = "../../src/server.js",
        request = require('request'),
        tests = suite.tests || [],
        expectation,
        actual,
        expected;

    //Start testing all the tests defined in the Suite        
    tests.forEach(function(test) {
        it(test.describe, function(done) {

            var server = require(SERVER_FILE_PATH).server;
            //Setup defined routes 
            test.routes = test.routes || [];
            test.routes.forEach(function(route) {
                server.onGet(route.path, route.handler);
            });

            server.start(suite.port);

            //make a request and expect a result
            request[test.request.method || "get"]({
                url: test.request.url,
                headers: test.request.headers,
                body: test.request.body
            }, function(error, response, body) {
                expectation = test.expectation;

                expect(response.statusCode).toBe(expectation.statusCode);

                //Test headers
                expectation.headers = expectation.headers || {};
                Object.keys(expectation.headers).forEach(function(expectedName) {
                    expected = expectation.headers[expectedName];
                    actual = response.headers[expectedName] || response.headers[expectedName.toLowerCase()];
                    expect(actual).toBe(expected);

                });

                //Test data
                if (expectation.data) {
                    if (response.headers["content-type"] === "application/json") {
                        response.body = JSON.parse(response.body || "{}");
                        Object.keys(expectation.data).forEach(function(expectedName) {
                            expected = expectation.data[expectedName];
                            actual = response.body[expectedName];
                            expect(actual).toBe(expected);
                        });
                    } else {
                        expect(response.body).toBe(expectation.data);
                    }
                }
                server.stop();
                done();
            }, 250);
        });
    });

});
