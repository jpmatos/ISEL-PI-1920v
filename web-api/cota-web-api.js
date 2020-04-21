'use strict'

module.exports = (router, cotaController, groupController) => {
    router.get('/', (req, res) => cotaController.home(req, res))
    router.get('/popular', (req, res) => cotaController.popular(req, res))
    router.get('/tv/:seriesID', (req, res) => cotaController.searchSeries(req, res))

    router.post('/groups', (req, res) => groupController.create(req, res))
    router.put('/groups/:groupID', (req, res) => groupController.edit(req, res))
    router.get('/groups', (req, res) => groupController.getAll(req, res))
    router.get('/groups/:groupID', (req, res) => groupController.getSingle(req, res))
    router.put('/groups/:groupID/series/:seriesID', (req, res) => groupController.addSeries(req, res))
    router.delete('/groups/:groupID/series/:seriesID', (req, res) => groupController.removeSeries(req, res))
    router.get('/groups/:groupID/series', (req, res) => groupController.getSeries(req, res))
    
    return router
}
