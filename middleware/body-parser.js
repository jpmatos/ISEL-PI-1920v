'use strict'

module.exports =  (req, res, next) => {
    let body = []
    req.on('data', (chunk) => {
        body.push(chunk)
    }).on('end', () => {
        if(body.length > 0)
            req.body = JSON.parse(Buffer.concat(body).toString())
        next()
    })
}