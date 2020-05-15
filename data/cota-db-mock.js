'use strict'

class CotaDB{
    
    constructor(){
        this.documents = []
        this.id = 1000
    }

    static init(){
        return new CotaDB()
    }

    create(document, cb){
        const doc = {
            '_id': this.id.toString(),
            '_source': document
        }
        this.documents.push(doc)
        this.id += 1
        cb(null, doc)
    }

    update(id, document, cb) {
        let found = this.documents.find(item => item._id == parseInt(id))
        if(!found)
            return cb({
                'statusCode': 404,
                'message': `Could not find group '${id}'!`
            })

        if(document.name)
            found._source.name = document.name
        if(document.description)
            found._source.description = document.description
        if(document.series)
            found._source.series = document.series
            
        const res = {
            '_id': found._id,
            'get': {'_source': found._source}
        }

        cb(null, res)
    }

    delete(id, cb){
        const documentIdx = this.documents.findIndex(item => item.id == id)
        if(documentIdx === -1)
            return cb({
                'statusCode': 404,
                'message': `Could not find group '${id}'!`
            })
        
        this.documents = this.documents.splice(documentIdx, 1)

        cb(null, {
            '_id': id,
            'get': {'_source': this.documents[documentIdx]._source}
        })
    }

    getAll(cb){
        const res = {'hits': {'hits': this.documents}}
        
        cb(null, res)
    }

    findByID(id, cb){
        let found = this.documents.find(item => item._id == parseInt(id))
        if(!found)
            return cb({
                'statusCode': 404,
                'message': `Could not find group '${id}'!`
            })

        cb(null, found)
    }

    resetID(){
        this.id = 1000
    }
}
module.exports = CotaDB