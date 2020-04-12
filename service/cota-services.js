'use strict'

module.exports = class cotaServices {

    constructor(movieAPI){
        this.movieAPI = movieAPI
    }

    static init (movieAPI){
        return new cotaServices(movieAPI)
    }

    getPopular(cb){
        this.movieAPI.getPopularMovies((err, moviesData) => {
            if(err) return cb(err)
            cb(null, moviesData)
        })
    }
}