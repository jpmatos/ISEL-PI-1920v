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
        document._id = this.id
        this.id += 1
        this.documents.push(document)
        cb(null, document)
    }

    update(id, document, cb) {
        let found = this.documents.find(item => item._id == parseInt(id))
        if(document.name)
            found.name = document.name
        if(document.description)
            found.description = document.description
        if(document.series)
            found.series = document.series
        cb(null, found)
    }

    getAll(cb){
        cb(null, this.documents)
    }

    findByID(id, cb){
        let found = this.documents.find(item => item._id == parseInt(id))
        cb(null, found)
    }
} 