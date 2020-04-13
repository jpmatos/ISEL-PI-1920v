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
            const movies = []
            if(err) return cb(err)
            moviesData.results.forEach(element => {
                movies.push({
                    'popularity':element.popularity,
                    'id':element.id,
                    'title': element.original_title
                })
            });
            cb(null, movies)
        })
    }

    searchSerie(serie, cb){
        this.movieAPI.getSerieShow(serie, (err, seriesData) => {
            const series = []
            if(err) return cb(err)
            seriesData.results.forEach(element => {
                series.push({
                    'name': element.name,
                    'popularity': element.popularity
                })
            })
            cb(null, series)
        })
    }
}