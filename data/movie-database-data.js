'use strict'

module.exports = class movieData {

    constructor(request, baseURL, token){
        this.request = request
        this.baseURL = baseURL
        this.token = token
    }

    static init(request, baseURL, token){
        return new movieData(request, baseURL, token)
    }

    getPopularMovies(cb){
        this.makeRequest('GET', '/movie/popular', null, cb)
    }

    getSerieShow(serie, cb){
        this.makeRequest('GET', '/search/tv', `query=${serie}&`, cb)
    }

    makeRequest(method, uri, queryParams, callback) {
        if(queryParams == null || queryParams == undefined)
            queryParams = ""
        this.request({
            'method': method,
            'uri': this.baseURL + uri + "?" + queryParams + "api_key=" + this.token,
            'json': true,
            // 'headers': {
            //     'X-Auth-Token': this.token
            // },
            // 'qs': queryParams
        }, (err, res, body) => {
            if(err || res.statusCode != 200) 
                return callback(err || body)
            callback(null, body)
        })
    }
}