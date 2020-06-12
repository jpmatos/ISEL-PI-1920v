'use strict'

function setAuthRouter(router, authController){
    router.get('/session', (req, res, next) => authController.session(req, res, next))
    router.post('/register', (req, res, next) => authController.register(req, res, next))
    router.post('/login', (req, res, next) => authController.login(req, res, next))
    router.post('/logout', (req, res, next) => authController.logout(req, res, next))

    return router
}
module.exports = setAuthRouter