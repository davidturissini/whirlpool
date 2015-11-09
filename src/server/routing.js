'use strict';

const rx = require('rx');

module.exports = function (serverStream, routesStream) {
    const routingStream = serverStream.combineLatest(
            routesStream,
            function (app, routes) {
                return { app:app, routes:routes };
            }
        )
        .flatMapLatest(({ appData }) => {

            return rx.Observable.create(function (o) {
                
                appData.routes.forEach(function (data) {

                    appData.app[data.method](data.path, function (req, res) {
                        o.onNext({
                            req:req,
                            res:res,
                            handler:data.handler
                        });
                    });
                });

            });

        })
        .publish();
        

    routingStream.connect();

    return routingStream;
}