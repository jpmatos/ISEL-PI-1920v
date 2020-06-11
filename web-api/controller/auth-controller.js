'use strict'

class AuthController{

    constructor(service){
        this.service = service
    }

    static init(service){
        return new AuthController(service)
    }

    register(req, res, next){
        this.service.registerUser(req.body.username, req.body.password)
            //TODO Login
            .then(user => res.status(201).json(user))
            .catch(next)
    }
}
module.exports = AuthController