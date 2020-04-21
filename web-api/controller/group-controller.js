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
        this.service.editGroup(req.params.groupID, req.body.name, req.body.description, (err, groupData) => {
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

    addSeries(req, res){
        this.service.addSeriesToGroup(req.params.groupID, req.params.seriesID, (err, group) => {
            this.constructor.buildResponse(err, group, res)
        })
    }

    removeSeries(req, res){
        this.service.removeSeriesFromGroup(req.params.groupID, req.params.seriesID, (err, group) => {
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
            res.writeHead(err.statusCode ? err.statusCode : 500, {
                'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({'message': err.status_message ? err.status_message : err.message }))
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