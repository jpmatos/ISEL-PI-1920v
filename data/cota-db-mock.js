'use strict'

class CotaDB{
    
    constructor(){
        this.documents = []
        this.id = 1000
    }

    static init(){
        return new CotaDB()
    }

    create(document){
        const doc = {
            '_id': this.id.toString(),
            '_source': document
        }
        this.documents.push(doc)
        this.id += 1

        return Promise.resolve(doc)
    }

    update(id, document) {
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

        return Promise.resolve(res)
    }

    delete(id){
        const documentIdx = this.documents.findIndex(item => item.id == id)
        if(documentIdx === -1)
            return cb({
                'statusCode': 404,
                'message': `Could not find group '${id}'!`
            })
        
        this.documents = this.documents.splice(documentIdx, 1)

        return Promise.resolve({
            '_id': id,
            'get': {'_source': this.documents[documentIdx]._source}
        })
    }

    getAll(ownerID){
        const res = {'hits': {'hits': this.documents.filter(doc => doc.ownerID = ownerID)}}
        
        return Promise.resolve(res)
    }

    findByID(id){
        let found = this.documents.find(item => item._id == parseInt(id))
        if(!found)
            return Promise.reject({
                'statusCode': 404,
                'message': `Could not find group '${id}'!`
            })

        return Promise.resolve(found)
    }

    resetID(){
        this.id = 1000
    }
}
module.exports = CotaDB