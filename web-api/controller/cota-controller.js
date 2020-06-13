'use strict'

class CotaController {
    
    constructor(service){
        this.service = service
    }

    static init(service){
        return new CotaController(service)
    }

    popular(req, res, next){
        this.service
            .getPopular()
            .then(movies => res.status(200).json(movies))
            .catch(next)
    }

    searchSeries(req, res, next){
        this.service
            .searchSeries(req.params.seriesID)
            .then(series => res.status(200).json(series))
            .catch(next)
    }
}
module.exports = CotaController