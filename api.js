const fs = require('fs');
const URL = require('url');

let lesMots = [[],[],[],[],[],[],[]];
let parties = {};
let id=0;

class Game{
    constructor(niveau){
        this.win = false;
        this.mot = "";
        this.minLetter = 6;
        this.maxLetter = 7;
        if(niveau == "intermediaire"){
            this.minLetter = 8;
            this.maxLetter =9;
        }
        else if(niveau == "difficile"){
            this.minLetter = 10;
            this.maxLetter = 12;
        }
        this.nbreErreurs = 0;
        this.nbreLettres = Math.floor(Math.random()*lesMots.length) + 6;
        while( (this.nbreLettres < this.minLetter)||(this.nbreLettres > this.maxLetter)){
            this.nbreLettres = Math.floor(Math.random()*lesMots.length) + 6;
        }
        this.motSecret = lesMots[this.nbreLettres-6][Math.floor(Math.random()*lesMots[this.nbreLettres-6].length)];
        this.tabMot = [];
        for(let i=0; i < this.motSecret.length ; i++){
            this.tabMot.push(" _");
        }
    }

    checkWin(){             //vérifie si l'utilisateur a gagné la partie
        for(let i=0;i<this.motSecret.length;i++){
            if(this.motSecret[i]!=this.tabMot[i]){
                return false;
            }
        }
        return true;    
    }

    testLetter(lettre){
        if(this.motSecret.includes(lettre)){
            for(let i=0;i<this.motSecret.length;i++){
                if(this.motSecret[i] == lettre){
                    this.tabMot[i] = lettre;
                }
            }
            this.win = this.checkWin();
            this.mot = "";
            if(this.nbreErreurs>=10){
                this.mot = motSecret;
            }
            return JSON.stringify({motEnCours : this.tabMot, WIN : this.win,  MOT : this.mot, ERREURS : this.nbreErreurs, lettreBonne : true});
        }
        else{
            this.nbreErreurs++;
            this.mot = "";
            if(this.nbreErreurs>=10){
                this.mot = this.motSecret;
            }
            return JSON.stringify({motEnCours : this.tabMot, WIN : false, MOT : this.mot, ERREURS : this.nbreErreurs, lettreBonne : false});
        }
    }
}



fs.readFile('livre.txt', function(error,data){
    if(!error){
        let livre = data.toString().split(/[(\r?\n),.';! ]/);
        for(let i=0; i< livre.length; i++){
            let motCourant = livre[i];
            for(let g=6;g<=12;g++){
                if(motCourant.length == g){
                    let minuscule = true;
                    for(let j=0; j<motCourant.length; j++){
                        if( (motCourant.charCodeAt(j)<97)||(motCourant.charCodeAt(j)>122) ){
                            minuscule = false;
                        }
                    }
                    if(minuscule){
                        lesMots[g-6].push(motCourant);
                    }
                }
            }
            
        }
    }
});


function manageRequest(request, response) {
    let url = request.url.split("?");
    let urlSplitte = url[0].split("/");
    let fonction = urlSplitte[2];
    /*
    if(fonction == "getWord"){
        let minLetter = url[1].split("&")[0].split("=")[1];
        let maxLetter = url[1].split("&")[1].split("=")[1];
        minLetter = parseInt(minLetter);
        maxLetter = parseInt(maxLetter);
        nbreLettres = Math.floor(Math.random()*lesMots.length) + 6;
        while( (nbreLettres < minLetter)||(nbreLettres > maxLetter)){
            nbreLettres = Math.floor(Math.random()*lesMots.length) + 6;
        }
        motSecret = lesMots[nbreLettres-6][Math.floor(Math.random()*lesMots[nbreLettres-6].length)];
        response.statusCode = 200;
        response.end(motSecret);
    } */
    if(fonction == "newGame"){
        let difficulte = url[1].split("=")[1];
        let instanceDeJeu = new Game(difficulte);
        id++;
        parties[id] = instanceDeJeu;
        response.statusCode = 200;
        response.end( JSON.stringify( {taille : instanceDeJeu.motSecret.length, ID : id}));
    }
    else if(fonction == "testLetter"){
        let lettre = url[1].split("&")[0].split("=")[1].toLowerCase();
        let idEnCours = url[1].split("&")[1].split("=")[1].toLowerCase();
        response.statusCode = 200;
        response.end(parties[idEnCours].testLetter(lettre));
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
}



exports.manage = manageRequest;