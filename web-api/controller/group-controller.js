'use strict'

class GroupController{

    constructor(service, boom){
        this.service = service
        this.boom = boom
        this.regexNoEmpty = /[^A-Za-z0-9]+|^$|\s+/g
        this.regexNumber = /[^0-9]+$|^$|\s+/g
        this.regex = /[^A-Za-z0-9]+/g
    }

    static init(service, boom){
        return new GroupController(service, boom)
    }

    create(req, res, next){
        const name = req.body.name
        const description = req.body.description
        const priv = req.body.checkPrivate
        const userID = req.user._id

        if(this.regexNoEmpty.test(name))
            return next(this.boom.badRequest('Invalid name'))
        if(this.regexNoEmpty.test(description))
            return next(this.boom.badRequest('Invalid description'))

        this.service
            .createGroup(name, description, priv, userID)
            .then(groupData => res.status(201).json(groupData))
            .catch(next)
    }

    edit(req, res, next) {
        const groupID = req.params.groupID
        const name = req.body.name
        const description = req.body.description
        const priv = req.body.checkPrivate
        const userID = req.user._id

        if(this.regex.test(name))
            return next(this.boom.badRequest('Invalid name'))
        if(this.regex.test(description))
            return next(this.boom.badRequest('Invalid description'))

        this.service
            .editGroup(groupID, name, description, priv, userID)
            .then(groupData => res.status(200).json(groupData))
            .catch(next)
    }

    delete(req, res, next) {
        const groupID = req.params.groupID
        const userID = req.user._id

        this.service
            .deleteGroup(groupID, userID)
            .then(group => res.status(200).json(group))
            .catch(next)
    }

    getAll(req, res, next){
        const userID = req.user._id

        this.service
            .getAllGroups(userID)
            .then(groups => res.status(200).json(groups))
            .catch(next)
    }

    getSingle(req, res, next){
        const groupID = req.params.groupID
        const userID = req.user._id

        this.service
            .getGroup(groupID, userID)
            .then(group => res.status(200).json(group))
            .catch(next)
    }

    addSeries(req, res, next){
        const groupID = req.params.groupID
        const seriesID = req.params.seriesID
        const userID = req.user._id

        this.service
            .addSeriesToGroup(groupID, seriesID, userID)
            .then(groupData => res.status(200).json(groupData))
            .catch(next)
    }

    removeSeries(req, res, next){
        const groupID = req.params.groupID
        const seriesID = req.params.seriesID
        const userID = req.user._id

        this.service
            .removeSeriesFromGroup(groupID, seriesID, userID)
            .then(groupData => res.status(200).json(groupData))
            .catch(next)
    }

    getSeries(req, res, next){
        const groupID = req.params.groupID
        const min = req.query.min
        const max = req.query.max
        const userID = req.user._id

        if(this.regexNumber.test(min))
            return next(this.boom.badRequest('Invalid minimum rating'))
        if(this.regexNumber.test(max))
            return next(this.boom.badRequest('Invalid maximum rating'))

        this.service
            .getSeriesSorted(groupID, min, max, userID)
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