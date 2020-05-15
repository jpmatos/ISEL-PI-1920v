'use strict'

class CotaServices {
    constructor(fs, path){
        this.fs = fs
        this.path = path
    }

    static init (){
        const fs = require('fs')
        const path = require('path')
        return new CotaServices(fs, path)
    }

    getPopular(cb){
        const filePath = this.path.join(__dirname, `/mock_data/getPopular.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    searchSeries(series, cb){
        const filePath = this.path.join(__dirname, `/mock_data/searchSeries-${series}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    createGroup(name, desc, cb){
        const filePath = this.path.join(__dirname, `/mock_data/createGroup-${name}-${desc}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    editGroup(id, name, desc, cb){
        const filePath = this.path.join(__dirname, `/mock_data/editGroup-${id}-${desc}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    getAllGroups(cb){
        const filePath = this.path.join(__dirname, `/mock_data/getAllGroups.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    getGroup(groupID, cb){
        const filePath = this.path.join(__dirname, `/mock_data/getGroup-${groupID}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    addSeriesToGroup(groupID, series, cb){
        const filePath = this.path.join(__dirname, `/mock_data/addSeriesToGroup-${groupID}-${series}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    removeSeriesFromGroup(groupID, series, cb){
        const filePath = this.path.join(__dirname, `/mock_data/removeSeriesFromGroup-${groupID}-${series}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    getSeriesSorted(groupID, min, max, cb){
        const filePath = this.path.join(__dirname, `/mock_data/getSeriesSorted-${groupID}-${min}-${max}.json`)
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
module.exports = CotaServices