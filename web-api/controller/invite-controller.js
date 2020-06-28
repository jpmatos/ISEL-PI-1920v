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

    accept(req, res, next){
        const userID = req.user._id
        const inviteID = req.params.inviteID

        this.service
            .acceptInvite(userID, inviteID)
            .then(message => res.status(200).json(message))
            .catch(next)
    }

    kick(req, res, next){
        const userID = req.user._id
        const groupID = req.params.groupID
        const inviteeID = req.params.inviteeID

        this.service
            .removeInvitee(userID, groupID, inviteeID)
            .then(message => res.status(200).json(message))
            .catch(next)
    }
}
module.exports = InviteController