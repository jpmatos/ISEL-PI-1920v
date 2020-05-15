'use strict'
const request = require('request')

class CotaDB{
    
    constructor(host, index){
        this.host = host
        this.index = index
    }

    static init(host, index){
        return new CotaDB(host, index)
    }

    create(document, cb){
        this.makeRequest('POST', `${this.index}/_doc`, cb, document)
    }

    update(id, document, cb) {
        this.makeRequest('POST', `${this.index}/_update/${id}?_source`, cb, { 'doc': document})
    }

    delete(id, cb){
        this.makeRequest('DELETE', `${this.index}/_update/${id}`, cb)
    }

    getAll(cb){
        this.makeRequest('GET', `${this.index}/_search`, cb)
    }

    findByID(id, cb){
        this.makeRequest('GET', `${this.index}/_doc/${id}`, cb)
    }

    resetID(){

    }

    makeRequest(method, uri, callback, data = undefined) {
        let options = {
            'method': method,
            'uri': `${this.host}/${uri}`,
            'json': true,
        }
        if(data) options.body = data

        request(options, (err, res, body) => {
            if(err) {
                return callback(err || body)
            }
            callback(null, body)
        })
    }
}
module.exports = CotaDB