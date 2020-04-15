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
            this.constructor.buildResponse(res, err, groupData, 201)
        })
    }

    edit(req, res) {
        this.service.editGroup(req.params.groupID, req.body.name, req.body.description, (err, groupData) => {
            this.constructor.buildResponse(res, err, groupData)
        })
    }

    /**
     * Builds the HTTP response
     * @param {IncomingMessage} req - **IncomingMessage** - the request object
     * @param {ServerResponse} res - **ServerResponse** the response object
     * @param {string} data - the data object
     * 
     * @private
     */
    static buildResponse(res, err, data, sucessCode = 200) {
        if(err) {
            // Return 404 if the requested resource does not exist
            let status = err.status || err.found ? null : '404'

            res.writeHead(status ? status : 500, status != 500 ? '' : 'Internal Server Error')
            res.end()
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