'use strict';

const express = require('express');
const bodyParser = require('body-parser');


module.exports = function (portStream) {

    return portStream.map((port) => {
        const app = express();

        // parse application/json
        app.use(bodyParser.json());

        app.use(function(req, res, next) {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "x-auth-token, Origin, X-Requested-With, Content-Type, Accept");
          next();
        });

        app.listen(port);

        return app;

    }).replay(undefined, 1);

};