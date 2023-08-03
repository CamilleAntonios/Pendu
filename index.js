const http = require('http');
const files = require("./files.js");
const api = require("./api.js");

http.createServer(function(request, response){
    url = request.url.split("/").filter((elem) => elem !="..");
    if(url[1] == "api"){
        api.manage(request,response);
    }
    else{
        files.manage(request,response);
    }
}).listen(8000);