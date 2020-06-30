'use strict'

class AuthController{

    constructor(service, boom){
        this.service = service
        this.boom = boom
    }

    static init(service, boom){
        return new AuthController(service, boom)
    }

    session(req, res, next){
        res.json({
            'isAuthenticated': req.isAuthenticated(),
            'user': req.user
        })
    }

    login(req, res, next){
        if(req.isAuthenticated())
            return next(this.boom.badRequest('Already authenticated'))
        
        this.service.verify(req.body.username, req.body.password)
            .then(isValid => {
                if(isValid)
                    return this.service.getUserData(req.body.username)
                else
                    next(this.boom.unauthorized('Invalid credentials'))
            })
            .then(user => {
                req.login(user, err => {
                    if(err) 
                        next(err)
                    else {
                        delete user.password;
                        res.status(200).json(user)
                    }
                })
            })
    }

    register(req, res, next){
        this.service.registerUser(req.body.username, req.body.password)
            .then(user => res.status(200).json(user))
            .catch(next)
    }

    logout(req, res, next){
        if(!req.isAuthenticated())
            return next(this.boom.badRequest('Not authenticated'))
        req.logout()
        res.json({'message': 'Successfuly logged out.'}).status(200)
        res.end()
    }

    delete(req, res, next){
        if(!req.isAuthenticated())
            return next(this.boom.badRequest('Not authenticated'))
        if(req.params.userID != req.user._id)
            return next(this.boom.badRequest('Wrong user'))

        this.service.deleteUser(req.user._id)
            .then(message => {
                req.logout()
                res.json(message).status(200)
            })
            .catch(next)
    }
}
module.exports = AuthController