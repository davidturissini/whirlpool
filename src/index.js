'use strict';

require('node-babel')();


const server = require('./server/server');
const routing = require('./server/routing');
const rx = require('rx');



module.exports = function (port, routes, config) {
    config = config || {};
    const cwd = config.cwd || process.cwd();
    const portStream = rx.Observable.return(port);

    const routesStream = rx.Observable.return(routes);
    const serverStream = server(portStream);
    const routingStream = routing(serverStream, routesStream);


    routingStream.subscribe((routesData) => {
        const req = routesData.req;
        const res = routesData.res;
        const handler = routesData.handler;
        const h = require(`${cwd}${handler}`);

        const handlerObservable = h(req);

        handlerObservable.subscribe(
            function (data) {
                res.write(data);
                res.end();
            }, 
            function (err) {
                const status = err.status || 500;
                const json = JSON.stringify({
                    message: err.message
                });
                console.log(err.stack);
                res.status(status).write(json);
                res.end();
            });

    });


    serverStream.subscribe(() => {
        console.log(`App listening on port ${port}`);
    });


    serverStream.connect();

    return serverStream;

}
