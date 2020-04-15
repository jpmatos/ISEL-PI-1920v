'use strict'

module.exports = class cotaDB{
    
    constructor(){
        this.documents = []
        this.id = 1000
    }

    static init(){
        return new cotaDB()
    }

    create(document, cb){
        document['_id'] = this.id
        this.id += 1
        this.documents.push(document)
        cb(null, document)
    }
} 