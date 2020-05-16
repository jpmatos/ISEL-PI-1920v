'use strict'

function setRouter(router, cotaController, groupController){
    router.get('/', (req, res, next) => cotaController.home(req, res, next))
    router.get('/popular', (req, res, next) => cotaController.popular(req, res, next))
    router.get('/tv/:seriesID', (req, res, next) => cotaController.searchSeries(req, res, next))

    router.post('/groups', (req, res, next) => groupController.create(req, res, next))
    router.put('/groups/:groupID', (req, res, next) => groupController.edit(req, res, next))
    router.get('/groups', (req, res, next) => groupController.getAll(req, res, next))
    router.get('/groups/:groupID', (req, res, next) => groupController.getSingle(req, res, next))
    router.put('/groups/:groupID/series/:seriesID', (req, res, next) => groupController.addSeries(req, res, next))
    router.delete('/groups/:groupID/series/:seriesID', (req, res, next) => groupController.removeSeries(req, res, next))
    router.get('/groups/:groupID/series', (req, res, next) => groupController.getSeries(req, res, next))
    
    return router
}
module.exports = setRouter