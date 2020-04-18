'use strict'

module.exports = class cotaServices {
    constructor(fs, path){
        this.fs = fs
        this.path = path
    }

    static init (){
        const fs = require('fs')
        const path = require('path')
        return new cotaServices(fs, path)
    }

    getPopular(cb){
        const filePath = this.path.join(__dirname, `/mock_data/getPopular.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    searchSerie(serie, cb){
        serie = serie.replace(" ", "_")
        const filePath = this.path.join(__dirname, `/mock_data/searchSerie-${serie}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    createGroup(name, desc, cb){
        name = name.replace(" ", "_")
        desc = desc.replace(" ", "_")
        const filePath = this.path.join(__dirname, `/mock_data/createGroup-${name}-${desc}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    editGroup(id, name, desc, cb){
        name = name.replace(" ", "_")
        desc = desc.replace(" ", "_")
        const filePath = this.path.join(__dirname, `/mock_data/editGroup-${id}-${name}-${desc}.json`)
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

    addSerieToGroup(groupID, serie, cb){
        serie = serie.replace(" ", "_")
        const filePath = this.path.join(__dirname, `/mock_data/addSerieToGroup-${groupID}-${serie}.json`)
        this.constructor.buildResponse(filePath, this.fs, cb)
    }

    removeSerieFromGroup(groupID, serie, cb){
        serie = serie.replace(" ", "_")
        const filePath = this.path.join(__dirname, `/mock_data/removeSerieFromGroup-${groupID}-${serie}.json`)
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