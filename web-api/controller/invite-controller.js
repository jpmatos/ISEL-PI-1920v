'use strict'

class InviteController{

    constructor(service, boom){
        this.service = service
        this.boom = boom
    }

    static init(service, boom){
        return new InviteController(service, boom)
    }

    getAll(req, res, next){
        const userID = req.user._id

        this.service
            .getInvites(userID)
            .then(message => res.status(200).json(message))
            .catch(next)
    }

    invite(req, res, next){
        const groupID = req.params.groupID  //ID
        const inviterID = req.user._id      //ID
        const invitee = req.params.invitee  //name

        this.service
            .inviteToGroup(groupID, inviterID, invitee)
            .then(message => res.status(201).json(message))
            .catch(next)
    }

    delete(req, res, next){
        const userID = req.user._id
        const inviteID = req.params.inviteID

        this.service
            .deleteInvite(userID, inviteID)
            .then(message => res.status(200).json(message))
            .catch(next)
    }
}
module.exports = InviteController