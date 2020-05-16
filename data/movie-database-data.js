'use strict'

class MovieData {

    constructor(baseURL, token, fetch){
        this.baseURL = baseURL
        this.token = token
        this.fetch = fetch
    }

    static init(baseURL, token, fetch){
        return new MovieData(baseURL, token, fetch)
    }

    getPopularMovies(){
        return this.makeRequest('GET', '/movie/popular')
    }

    getSeriesShow(series){
        return this.makeRequest('GET', `/tv/${series}`)
    }

    makeRequest(method, uri) {
        return this
            .fetch(this.baseURL + uri + "?api_key=" + this.token, {'method': method})
            .then(res => res.json())
    }
}
module.exports = MovieData