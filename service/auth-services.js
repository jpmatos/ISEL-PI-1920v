'use strict'

class AuthServices{
    constructor(db){
        this.db = db
    }

    static init(db){
        return new AuthServices(db)
    }

    registerUser(username, password){
        return this.existsUser(username)
            .then(exists => {
                if(!exists){
                    const user = this.createUser(username, password)
                    return user
                }
                return Promise.resolve({'message': 'User already exists'})
            })
            .catch(err => {
                console.log(err)
            })
    }

    createUser(username, password){
        return this.db.create({
            'username': username,
            'password': password
        })
        .then(result => {
            return {
                'username': username,
                'password': password
            }
        })
        .catch(err => {
            console.log(err)
        })
    }

    existsUser(username){
        return this.getUserData(username)
            .then(res => res instanceof Object)
            .catch(err => {
                if(err.statusCode == 404)
                    return false
                throw err
            })
    }

    getUserData(username){
        return this.db.search(`username:${username}`)
            .then(result => {
                if(result.hits.total.value == 0){
                    return null
                }
                const userData = result.hits.hits[0]
                return {
                    '_id': userData._id,
                    ...userData._source
                }
            })
    }
}
module.exports = AuthServices