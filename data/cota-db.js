'use strict'

class CotaDB{
    
    constructor(host, index, fetch){
        this.host = host
        this.index = index
        this.fetch = fetch
    }

    static init(host, index, fetch){
        return new CotaDB(host, index, fetch)
    }

    create(document){
        return this.makeRequest('POST', `${this.index}/_doc`, document)
    }

    update(id, document) {
        return this.makeRequest('POST', `${this.index}/_update/${id}?_source`, { 'doc': document })
    }

    delete(id){
        return this.makeRequest('DELETE', `${this.index}/_doc/${id}`)
    }

    getAll(ownerID){
        return this.makeRequest('GET', `${this.index}/_search?q=owner:${ownerID}`)
    }

    getAll(){
        return this.makeRequest('GET', `${this.index}/_search`)
    }

    findByID(id){
        return this.makeRequest('GET', `${this.index}/_doc/${id}`)
    }

    search(query){
        return this.makeRequest('GET', `${this.index}/_search?q=${query}`)
    }

    resetID(){

    }

    makeRequest(method, uri, body = undefined) {
        return this
            .fetch(`${this.host}/${uri}`, {
                    'method': method,
                    'body': JSON.stringify(body),
                    'headers': {'Content-Type': 'application/json'},
                })
            .then(res => res.json())
    }
}
module.exports = CotaDB