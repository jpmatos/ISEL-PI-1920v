'use strict'

class MovieData {
    constructor(fs, path){
        this.fs = fs
        this.path = path
    }

    static init (){
        const fs = require('fs')
        const path = require('path')
        return new MovieData(fs, path)
    }

    getPopularMovies(cb){
        const filePath = this.path.join(__dirname, `/mock_data/getPopularMovies.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    getSeriesShow(series, cb){
        const filePath = this.path.join(__dirname, `/mock_data/getSeriesShow-${series}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    static buildResponse(filePath, fs, cb){
        fs.readFile(filePath, (err, rawData) => {
            if(err)
                return cb({
                    "message": `Could not find mock file in path ${filePath}`,
                    "status": 404
                })
            const data = JSON.parse(rawData)
            cb(null, data)
        })
    }
}
module.exports = MovieData