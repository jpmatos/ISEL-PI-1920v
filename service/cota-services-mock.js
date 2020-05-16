'use strict'

class CotaServices {
    constructor(fs, path){
        this.fs = fs
        this.path = path
    }

    static init (){
        const fs = require('fs').promises
        const path = require('path')
        return new CotaServices(fs, path)
    }

    getPopular(){
        const filePath = this.path.join(__dirname, `/mock_data/getPopular.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    searchSeries(series){
        const filePath = this.path.join(__dirname, `/mock_data/searchSeries-${series}.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    createGroup(name, desc){
        const filePath = this.path.join(__dirname, `/mock_data/createGroup-${name}-${desc}.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    editGroup(id, name, desc){
        const filePath = this.path.join(__dirname, `/mock_data/editGroup-${id}-${desc}.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    getAllGroups(cb){
        const filePath = this.path.join(__dirname, `/mock_data/getAllGroups.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    getGroup(groupID, cb){
        const filePath = this.path.join(__dirname, `/mock_data/getGroup-${groupID}.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    addSeriesToGroup(groupID, series, cb){
        const filePath = this.path.join(__dirname, `/mock_data/addSeriesToGroup-${groupID}-${series}.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    removeSeriesFromGroup(groupID, series, cb){
        const filePath = this.path.join(__dirname, `/mock_data/removeSeriesFromGroup-${groupID}-${series}.json`)
        return this.constructor.buildResponse(filePath, this.fs)
    }

    getSeriesSorted(groupID, min, max, cb){
        const filePath = this.path.join(__dirname, `/mock_data/getSeriesSorted-${groupID}-${min}-${max}.json`)
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
module.exports = CotaServices