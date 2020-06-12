'use strict'

function setRouter(router, cotaController, groupController, boom) {
    // router.get('/', (req, res, next) => cotaController.home(req, res, next))
    router.get('/popular', (req, res, next) => cotaController.popular(req, res, next))
    router.get('/tv/:seriesID', (req, res, next) => cotaController.searchSeries(req, res, next))

    router.post('/groups', requireAuth, (req, res, next) => groupController.create(req, res, next))
    router.put('/groups/:groupID', requireAuth, (req, res, next) => groupController.edit(req, res, next))
    router.get('/groups', requireAuth, (req, res, next) => groupController.getAll(req, res, next))
    router.delete('/groups/:groupID', requireAuth, (req, res, next) => groupController.delete(req, res, next))
    router.get('/groups/:groupID', requireAuth, (req, res, next) => groupController.getSingle(req, res, next))
    router.put('/groups/:groupID/series/:seriesID', requireAuth, (req, res, next) => groupController.addSeries(req, res, next))
    router.delete('/groups/:groupID/series/:seriesID', requireAuth, (req, res, next) => groupController.removeSeries(req, res, next))
    router.get('/groups/:groupID/series', requireAuth, (req, res, next) => groupController.getSeries(req, res, next))

    return router

    function requireAuth(req, res, next){
        if(req.isAuthenticated()) 
            next()
        else 
            next(boom.unauthorized('This endpoint requires authentication'))
    }
}
module.exports = setRouter
