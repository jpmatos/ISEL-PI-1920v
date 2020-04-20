'use strict'

module.exports = (router, cotaController, groupController) => {
    router.get('/', (req, res) => cotaController.home(req, res))
    router.get('/popular', (req, res) => cotaController.popular(req, res))
    router.get('/tv/:serieID', (req, res) => cotaController.searchSerie(req, res))

    router.post('/groups', (req, res) => groupController.create(req, res))
    router.put('/groups', (req, res) => groupController.edit(req, res))
    router.get('/groups', (req, res) => groupController.getAll(req, res))
    router.get('/groups/:groupID', (req, res) => groupController.getSingle(req, res))
    router.put('/groups/series', (req, res) => groupController.addSerie(req, res))
    router.delete('/groups/series', (req, res) => groupController.removeSerie(req, res))
    router.get('/groups/:groupID/series', (req, res) => groupController.getSeries(req, res))
    
    return router
}
