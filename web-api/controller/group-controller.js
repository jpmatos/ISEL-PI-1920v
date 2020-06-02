'use strict'

class GroupController{

    constructor(service){
        this.service = service
    }

    static init(service){
        return new GroupController(service)
    }

    create(req, res, next){
        this.service
            .createGroup(req.body.name, req.body.description)
            .then(groupData => res.status(201).json(groupData))
            .catch(next)
    }

    edit(req, res, next) {
        this.service
            .editGroup(req.params.groupID, req.body.name, req.body.description)
            .then(groupData => res.status(200).json(groupData))
            .catch(next)
    }

    delete(req, res, next) {
        this.service
            .deleteGroup(req.params.groupID)
            .then(group => res.status(200).json(group))
            .catch(next)
    }

    getAll(req, res, next){
        this.service
            .getAllGroups()
            .then(groups => res.status(200).json(groups))
            .catch(next)
    }

    getSingle(req, res, next){
        this.service
            .getGroup(req.params.groupID)
            .then(group => res.status(200).json(group))
            .catch(next)
    }

    addSeries(req, res, next){
        this.service
            .addSeriesToGroup(req.params.groupID, req.params.seriesID)
            .then(groupData => res.status(200).json(groupData))
            .catch(next)
    }

    removeSeries(req, res, next){
        this.service
            .removeSeriesFromGroup(req.params.groupID, req.params.seriesID)
            .then(groupData => res.status(200).json(groupData))
            .catch(next)
    }

    getSeries(req, res, next){
        this.service
            .getSeriesSorted(req.params.groupID, req.query.min, req.query.max)
            .then(seriesData => res.status(200).json(seriesData))
            .catch(next)
    }

    // /**
    //  * Builds the HTTP response
    //  * @param {ServerResponse} res - **ServerResponse** the response object
    //  * @param {string} data - the data object
    //  * 
    //  * @private
    //  */
    // static buildResponse(err, data, res, sucessCode = 200) {
    //     if(err) {
    //         res.writeHead(err.statusCode ? err.statusCode : 500, {
    //             'Content-Type': 'application/json'
    //         })
    //         res.end(JSON.stringify({'message': err.status_message ? err.status_message : err.message }))
    //     }
    //     else {
    //         res.writeHead(sucessCode, {
    //             'Content-Type': 'application/json'
    //         })
    //         if(typeof data === 'object') {
    //             data = JSON.stringify(data)
    //         }
    //         res.end(data)
    //     }
    // }
}
module.exports = GroupController