'use strict'

module.exports = class HashRouter {
    
    constructor(){
        this.routes = []
        this.resourceIdSelector = el => el
        this.hashSelector = el => el
    }

    /**
     * Register a new route
     * @param {string} hash 
     * @param {function} callback 
     */
    use(hash, callback){
        this.routes.push({hash, callback})
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
        for(let route of this.routes){
            if(route.hash == this.hashSelector(fragment)){
                return route.callback(this.resourceIdSelector(fragment))
            }
        }
        this.fallback(fragment)
    }
}
