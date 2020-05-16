'use strict'

class MovieData {
    constructor(fs, path){
        this.fs = fs
        this.path = path
    }

    static init (){
        const fs = require('fs').promises
        const path = require('path')
        return new MovieData(fs, path)
    }

    getPopularMovies(){
        const filePath = this.path.join(__dirname, `/mock_data/getPopularMovies.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    getSeriesShow(series){
        const filePath = this.path.join(__dirname, `/mock_data/getSeriesShow-${series}.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    static buildResponse(filePath, fs){
        return fs
            .readFile(filePath)
            .then(rawData => {
                const data = JSON.parse(rawData)
                return data
            })
            .catch(err => {
                return {
                    "message": `Could not find mock file in path ${filePath}`,
                    "status": 404
                }
            })
    }
}
module.exports = MovieData