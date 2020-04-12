'use strict'

module.exports = class cotaController {
    
    constructor(cota){
        this.cota = cota
    }

    static init (cota){
        return new cotaController(cota)
    }

    home(req, res){
        res.writeHead(200, {
            'Content-Type' : 'text/plain'
        })
        res.end('Hello World!')
    }

    popular(req, res){
        this.cota.getPopular((err, movies) => {
            this.constructor.buildResponse(res, err, movies)
        })
    }

    /**
     * Builds the HTTP response
     * 
     * @param {IncomingMessage} req - **IncomingMessage** - the request object
     * @param {ServerResponse} res - **ServerResponse** the response object
     * @param {string} data the data object
     * 
     * @private
     */
    static buildResponse(res, err, data, sucessCode = 200) {
        if(err) {
            // TODO: Return 404 if the requested resource does not exist
            res.writeHead(500, 'Internal Server Error')
            res.end()
        }
        else {
            res.writeHead(sucessCode, {
                'Content-Type': 'application/json'
            })
            if(typeof data === 'object') {
                data = JSON.stringify(data)
            }
            res.end(data)
        }
    }
}