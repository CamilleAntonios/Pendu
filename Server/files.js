const URL = require('url');
const fs = require('fs');
const path = require('path');

const front = "./front";
const index = "index.html";

const mimeTypes = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.md': 'text/plain',
    'default': 'application/octet-stream'
};

function manageRequest(request, response) {
    let chemin = URL.parse(request.url);
    let pathname = "";
    if(chemin.pathname == "/"){
        pathname = "./front/index.html"
    }
    else{
        pathname = front + chemin.pathname;
    }
    fs.exists(pathname, function(bool){
        if(bool){
            fs.readFile(pathname, function(error,data){
                if(!error){
                    response.statusCode = 200;
                    response.setHeader('Content-type', mimeTypes[path.parse(pathname).ext]);
                    response.end(data);
                }
                else{
                    response.statusCode = 307;
                    response.end("Y'a une erreur mec");
                }
            });
        }
        else{
            response.statusCode = 404;
            response.setHeader('Content-type', 'text/html');
            fs.readFile("./front/404Error.html",function(err,data){
                if(!err){
                    response.end(data);
                }
                else{
                    response.statusCode = 307;
                    response.end("Y'a une erreur mec");
                }
            });
        }
    });
      
}

exports.manage = manageRequest;