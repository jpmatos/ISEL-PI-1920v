'use strict'

class HashRouter {
    
    constructor(sessionHolder){
        this.sessionHolder = sessionHolder
        this.routes = []
        this.resourceIdSelector = el => el
        this.hashSelector = el => el
    }

    static init(sessionHolder){
        return new HashRouter(sessionHolder)
    }

    /**
     * Register a new route
     * @param {string} hash 
     * @param {function} callback 
     */
    use(hash, callback, requiresAuth = false){
        this.routes.push({hash, callback, requiresAuth})
        return this
    }

    noAuth(callback){
        this.noAuth = callback
        return this
    }

    /**
     * Route to use when no other matching route is found
     */
    fallback(callback){
        this.fallback = callback
        return this
    }

    /**
     * Mapper to select a resource id from a fragment
     * @param {*} selector 
     */
    resourceId(selector){
        this.resourceIdSelector = selector
        return this
    }

    /**
     * Mapper to select a hash name from a fragment
     * @param {*} selector 
     */
    hash(selector){
        this.hashSelector = selector
        return this
    }

    /**
     * Update route to match the current hash location
     */
    trigger(){
        this.findMatch(window.location.hash)
    }

    /**
     * Finds a matching route for the current fragment
     * @param {*} fragment 
     */
    findMatch(fragment){
        this.sessionHolder.getSession()
            .then(session => {
                for(let route of this.routes){
                    if(route.hash == this.hashSelector(fragment)){
                        if(route.requiresAuth == true && !session.isAuthenticated)
                            return this.noAuth(fragment)
                        else
                            return route.callback(this.resourceIdSelector(fragment))
                    }
                }
                this.fallback(fragment)
            })
    }
}
module.exports = HashRouter