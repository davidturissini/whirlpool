'use strict';

const rx = require('rx');

module.exports = function (serverStream, routesStream) {
    const routingStream = serverStream.combineLatest(
            routesStream,
            function (app, routes) {
                return { app, routes };
            }
        )
        .flatMapLatest(({ app, routes }) => {

            return rx.Observable.create(function (o) {
                
                routes.forEach(function ({ method, path, handler }) {

                    app[method](path, function (req, res) {
                        o.onNext({
                            req,
                            res,
                            handler
                        });
                    });
                });

            });

        })
        .publish();
        

    routingStream.connect();

    return routingStream;
}