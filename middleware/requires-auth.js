module.exports = (isDevMode) => {
    return function requireAuth(req, res, next){
        if(req.isAuthenticated() || isDevMode) 
            next()
        else 
            next(boom.unauthorized('This endpoint requires authentication'))
    }
}