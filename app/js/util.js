'use strict'

module.exports = {
    getJSON,
    postJSON,
    putJSON,
    deleteJSON
}

//Fetch and decode JSON
async function getJSON(url) {
    const options = {method: 'GET', credentials: 'same-origin'}
    return fetchJSON(url, options, [200])
}

async function postJSON(url, payload) {
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
    }
    return fetchJSON(url, options, [201, 202])
}

async function putJSON(url) {
    const options = {
        'method': 'PUT',
    }
    return fetchJSON(url, options, [200])
}

async function deleteJSON(url) {
    const options = {
        'method': 'DELETE',
    }
    return fetchJSON(url, options, [200])
}

async function fetchJSON(url, options, statusCode) {
    const resp = await fetch(url, options)
    const body = await resp.json()
    if(await !testStatusCode(resp.status, statusCode)) throw body
    else return body
}


async function testStatusCode(respStatus, statusCode) {
    statusCode.forEach(status => {
        if(respStatus == status) return true
    })
    return false
}