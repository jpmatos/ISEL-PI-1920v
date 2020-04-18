'use strict'

module.exports = class groupController{

    constructor(service){
        this.service = service
    }

    static init(service){
        return new groupController(service)
    }

    create(req, res){
        this.service.createGroup(req.body.name, req.body.description, (err, groupData) => {
            this.constructor.buildResponse(err, groupData, res, 201)
        })
    }

    edit(req, res) {
        this.service.editGroup(req.body.groupID, req.body.name, req.body.description, (err, groupData) => {
            this.constructor.buildResponse(err, groupData, res)
        })
    }

    getAll(req, res){
        this.service.getAllGroups((err, groups) => {
            this.constructor.buildResponse(err, groups, res)
        })
    }

    getSingle(req, res){
        this.service.getGroup(req.params.groupID, (err, group) => {
            this.constructor.buildResponse(err, group, res)
        })
    }

    addSerie(req, res){
        this.service.addSerieToGroup(req.body.groupID, req.body.serie, (err, group) => {
            this.constructor.buildResponse(err, group, res)
        })
    }

    removeSerie(req, res){
        this.service.removeSerieFromGroup(req.body.groupID, req.body.serie, (err, group) => {
            this.constructor.buildResponse(err, group, res)
        })
    }

    getSeries(req, res){
        this.service.getSeriesSorted(req.params.groupID, req.query.min, req.query.max, (err, seriesData) => {
            this.constructor.buildResponse(err, seriesData, res)
        })
    }

    /**
     * Builds the HTTP response
     * @param {ServerResponse} res - **ServerResponse** the response object
     * @param {string} data - the data object
     * 
     * @private
     */
    static buildResponse(err, data, res, sucessCode = 200) {
        if(err) {
            let status = err.status ? err.status : '500'
            res.writeHead(status, {
                'Content-Type': 'application/json'
            })
            if(typeof err === 'object') {
                const message = err.message ? err.message : 'Unspecified message'
                err = JSON.stringify({ 'message': message })
            }
            res.end(err)
        }
        else {
            res.writeHead(sucessCode, {
                'Content-Type': 'application/json'
            })
            if(typeof data === 'object') {
                data = JSON.stringify(data)
            }
            res.end(data)
        }
    }
}