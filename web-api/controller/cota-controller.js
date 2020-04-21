'use strict'

module.exports = class cotaController {
    
    constructor(cotaService){
        this.cotaService = cotaService
    }

    static init(cotaService){
        return new cotaController(cotaService)
    }

    home(req, res){
        res.writeHead(200, {
            'Content-Type' : 'text/plain'
        })
        res.end('Hello World!')
    }

    popular(req, res){
        this.cotaService.getPopular((err, movies) => {
            this.constructor.buildResponse(res, err, movies)
        })
    }

    searchSeries(req, res){
        this.cotaService.searchSeries(req.params.seriesID, (err, series) =>{
            this.constructor.buildResponse(res, err, series)
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
            res.writeHead(err.statusCode, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({'message': err.status_message }))
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