'use strict'

class CotaController {
    
    constructor(cotaService){
        this.cotaService = cotaService
    }

    static init(cotaService){
        return new CotaController(cotaService)
    }

    home(req, res, next){
        res.writeHead(200, {
            'Content-Type' : 'text/plain'
        })
        res.end('Hello World!')
    }

    popular(req, res, next){
        this.cotaService
            .getPopular()
            .then(movies => res.status(200).json(movies))
            .catch(next)
    }

    searchSeries(req, res, next){
        this.cotaService
            .searchSeries(req.params.seriesID)
            .then(series => res.status(200).json(series))
            .catch(next)
    }

    // /**
    //  * Builds the HTTP response
    //  * 
    //  * @param {IncomingMessage} req - **IncomingMessage** - the request object
    //  * @param {ServerResponse} res - **ServerResponse** the response object
    //  * @param {string} data the data object
    //  * 
    //  * @private
    //  */
    // static buildResponse(res, err, data, sucessCode = 200) {
    //     if(err) {
    //         res.writeHead(err.statusCode, {
    //             'Content-Type': 'application/json'
    //         })
    //         res.end(JSON.stringify({'message': err.status_message }))
    //     }
    //     else {
    //         res.writeHead(sucessCode, {
    //             'Content-Type': 'application/json'
    //         })
    //         if(typeof data === 'object') {
    //             data = JSON.stringify(data)
    //         }
    //         res.end(data)
    //     }
    // }
}
module.exports = CotaController