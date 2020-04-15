'use strict'

module.exports = class cotaServices {

    constructor(movieAPI, db){
        this.movieAPI = movieAPI
        this.db = db
    }

    static init (movieAPI, db){
        return new cotaServices(movieAPI, db)
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

    createGroup(name, desc, cb){
        const group = {'name': name, 'description': desc, 'series': []}
        this.db.create(group, (err, data) => {
            if(err) return cb(err)

            group['_id'] = data._id
            cb(null, group)
        })
    }
}