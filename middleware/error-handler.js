'use strict'

function errorHandler(boom){
    return (err, req, res, next) => {
        if (!boom.isBoom(err)) 
            boom.boomify(err);

        res.status(err.output.statusCode).json(err.output.payload);
    }
}
module.exports = errorHandler
