var https = require("https");
var querystring = require('querystring');

var client_id = '3aa8f7afb2a340f099385d32a73ca354'; // Your client id
var client_secret = '407106bdb489415fac4c60051474c1d4'; // Your secret

//https://api.spotify.com/v1/search?q=tania&type=artist

var request = function (method, url, headers, path, callback) {

    // form data
    var postData = querystring.stringify({
        grant_type: 'client_credentials'
    });

    var options = {
        host: url,
        path: path,
        method: method,
        headers: headers
    };

    //ritorno i dati in pezzi
    //il callback deve essere in grado di gestirli
    const req = https.request(options, (res) => { 
        res.on('end', (d) => {
            //fine dei pezzi
            callback(null, d, true);
        });
        res.on('data', (d) => {
            //pezzo di dato
            callback(null, d, false);
        });
    });
    
    req.on('error', (e) => {
        callback(e)
    });
    req.write(postData)
    req.end();

}

var getbase64auth = function(){
    return (new Buffer(client_id + ':' + client_secret).toString('base64'));
}

var getbearer = function(callback){
    request(
        "POST",
        "accounts.spotify.com",
        {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + getbase64auth()
        },
        "/api/token",
        (err, data, finished) =>{
            callback(err, data, finished)
        }
    );
}

module.exports = {
    request: request,
    getbase64auth: getbase64auth,
    getbearer: getbearer
}