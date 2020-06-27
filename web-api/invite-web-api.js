'use strict'

function setInviteRouter(router, inviteController, requireAuth) {
    
    router.get('/invites', 
        requireAuth, (req, res, next) => inviteController.getAll(req, res, next))
    router.post('/group/:groupID/user/:invitee',
        requireAuth, (req, res, next) => inviteController.invite(req, res, next))
    router.delete('/delete/:inviteID',
        requireAuth, (req, res, next) => inviteController.delete(req, res, next))

    return router
}
module.exports = setInviteRouter
