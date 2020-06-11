'use strict'

function setAuthRouter(router, authController){
    router.post('/register', (req, res, next) => authController.register(req, res, next))

    return router
}
module.exports = setAuthRouter