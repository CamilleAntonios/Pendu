let erreurs = 0;
let tailleMotSecret = 0;
let tabMot = [];
let lettreUtil = [];    
let minLetter = 6;
let maxLetter = 7;
let win = false;
let loose = false;
let id=0;

async function newGame(){                                       //Reset le jeu (lance/relance la partie)
    //On renvoie d'abbord tous les éléments de CSS à l'état initial
    document.getElementById("Popup").classList.add("notDisplayed");
    document.getElementById('tailleMot').classList.add("notDisplayed");
    document.getElementById("myModal").style.display = "none";
    let element = document.getElementById("grille");
    element.classList.remove("notDisplayed");
    let jouer = document.getElementById("jouer");
    jouer.classList.add("notDisplayed");
    videChamp();
    document.getElementById("champ").focus();
    
    var lettres = document.getElementsByClassName("lettres");
    for(let i=0;i<lettres.length;i++){
        lettres.item(i).classList.remove("bonnes");
        lettres.item(i).classList.remove("fausses");
    }

    //Puis on fait de même avec les différentes variables
    win = false;
    loose = false;
    lettreUtil = [];
    tabMot = ["P",'a','t','i','e','n','t','e','z',".",".","."];
    refreshMot();
    erreurs = 0;
    liste = await appelNewGame();
    tailleMotSecret = liste["taille"];
    id = liste["ID"];
    tabMot = [];
    for(let i=0; i < tailleMotSecret; i++){
        tabMot.push(" _");
    }
    refreshMot();
    refreshBonhomme();
}

function refreshMot(){          //rafraîchis le mot affiché (à deviner)
    let etat;
    etat = tabMot.join("");
    document.getElementById("mot").innerText = etat;
}

function refreshBonhomme(){                  //rafraîchis le bonhomme en fonction du nombre d'erreurs
    let id = ["poutre1","poutre2","poutre3","fil","tete","corps","brasG","brasD","jambeG","jambeD"]
    if(erreurs == 0){
        for(let i=0;i<id.length;i++){
            document.getElementById(id[i]).classList.add("notDiscovered");
        }
    }
    else{
        for(let i=0;i<erreurs;i++){
            document.getElementById(id[i]).classList.remove("notDiscovered");
        }
    }
}

async function test(lettre){      //Fonction qui s'exécute pour tester la lettre soumise par l'utilisateur
    document.getElementById("Popup").classList.add("notDisplayed");
    if(win||loose){         // On verifie d'abord si le joueur a déjà fini la partie
        document.getElementById("Popup").innerText = "Vous avez déjà fini la partie :/"
        document.getElementById("Popup").classList.remove("notDisplayed");
        return;
    }

    let lettreMin = lettre.toLowerCase();
    let lettreMaj = lettre.toUpperCase();

    if(checkLettre(lettreMin)){         //On regarde ensuite si l'utilisateur a déjà utilisé cette lettre
        document.getElementById("Popup").innerText = "Vous avez déjà utilisé cette lettre !"
        document.getElementById("Popup").classList.remove("notDisplayed");
        videChamp();
        document.getElementById("champ").focus();
        return;
    }
    if((lettreMin.charCodeAt()<97)||(lettreMin.charCodeAt()>122)){
        document.getElementById("Popup").innerText = "Veuillez utiliser une lettre..."
        document.getElementById("Popup").classList.remove("notDisplayed");
        videChamp();
        document.getElementById("champ").focus();
        return
    }

    lettreUtil.push(lettreMin);

    let dico = await appelTestLetter(lettreMin); //on récupère les infos du serveur
    win = dico["WIN"];
    tabMot = dico["motEnCours"];
    motSecret = dico["MOT"];
    erreurs = dico["ERREURS"];
    lettreBonne = dico["lettreBonne"];

    refreshMot();
    refreshBonhomme();
    document.getElementById("champ").focus();   
    videChamp();

    if(lettreBonne){
        document.getElementById(lettreMaj).classList.add("bonnes");
    }
    else{
        document.getElementById(lettreMaj).classList.add("fausses");
    }

    if(win){
        document.getElementById("myModal").style.display = "block";
        document.getElementById("textModal").innerText = "Félicitations, vous avez gagné ! Une autre partie ? ";
        return;
    }
    if(erreurs==10){
        loose = true;
        document.getElementById("myModal").style.display = "block";
        document.getElementById("textModal").innerText = "Dommage, vous avez perdu :( Le mot était "+motSecret+". On retente ? ";
        return;
    }
    
}

function checkLettre(Lettre){    //regarde si la lettre soumise par l'utilisateur a déjà été utilisée
    return lettreUtil.includes(Lettre);
}


function videChamp(){           //vide la zone d'input de l'utilisateur
    document.getElementById("champ").value="";
}

function appelNewGame(){
    let promise = fetch(`/api/newGame?niveau=${document.getElementById("difficultés").value}`);
    return promise.then(getLength);
}

async function getLength(reponse){
    if(reponse.ok){
        let text =await reponse.text();
        return JSON.parse(text);
    }
    return appelNewGame();    
}

function appelTestLetter(lettre){
    let promise = fetch(`/api/testLetter?Letter=${lettre}&id=${id}`);
    return promise.then(getJson);
}

async function getJson(reponse){
    if(reponse.ok){
        let text =await reponse.text();
        return JSON.parse(text);
    }
    return appelTestLetter();
}

/*
function appelServeur(){        //envoie un appel au serveur dans le but de récupérer un mot
    let promise = fetch(`/api/getWord?minLetter=${minLetter}&maxLetter=${maxLetter}`);
    return promise.then(getMot);
}

function getMot(reponse){       // renvoie soit le corps de la réponse du serveur (le mot), soit renvoie une requete au serveur (s'il y a eu une erreur)
    if(reponse.ok){
        let mot = reponse.text();
        return mot;
    }
    return appelServeur();
}
*/

let jouer = document.getElementById("jouer");  //permet de vérifier si l'utilisateur clique sur le bouton Jouer
jouer.addEventListener("click", newGame);

let tester = document.getElementById("test");   //permet de vérifier si l'utilisateur clique sur le bouton Tester
tester.addEventListener("click",()=> test(document.getElementById("champ").value))

document.addEventListener("keyup",function(event){ //permet de vérifier si l'utilisateur appuie sur la touche Entrée
    if(event.keyCode === 13){
        test(document.getElementById("champ").value);
    }
});


//Pour la modale

let modal = document.getElementById("myModal");

let span = document.getElementsByClassName("close")[0]; 
span.onclick = function() {
    modal.style.display = "none";
  }

window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
}

let rejouer = document.getElementById("rejouer"); //permet de vérifier si l'utilisateur clique sur le bouton Rejouer
rejouer.addEventListener("click", newGame);