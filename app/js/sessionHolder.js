'use strict'

const util = require('./util.js')

class SessionHolder{

    constructor(){
        this.session = null
    }

    static init(){
        return new SessionHolder()
    }

    updateSession(){
        return util.getJSON('/auth/session')
            .catch(err => util.showAlert('Fetch /auth/session: ' + JSON.stringify(err)))
            .then(session => {
                this.session = session
                return session
            })
    }

    getSession(){
        if (this.session == null)
            return this.updateSession()
        else
            return Promise.resolve(this.session)
    }
}
module.exports = SessionHolder