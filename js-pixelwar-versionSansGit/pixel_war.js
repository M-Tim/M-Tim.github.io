const serveur = `https://pixel-api.codenestedu.fr`;
const color = document.getElementById("couleurPixel");
const inputUID = document.getElementById("inputUID");
const infoServeur = document.querySelector(".infoServeur");
const voirTexte = document.getElementById("voirTexte");
const tableauPx = document.createElement('table');
const boutons = document.querySelectorAll(".equipe button");
const lieu = document.getElementById('midPart');
const tableauJoueurs = document.querySelector('.tableauStats tbody')
let UID;
let couleurChoisi = color.value;
let col;
let row;
let equipeChoisi;
let intervale;

/**
 * Ajoute un évenement "click" à chaque boutons qui attribuera l'équipe selon le bouton cliqué
 */
boutons.forEach((bouton) => {
    bouton.addEventListener("click", (event) => {
        equipeChoisi = event.target.value;
        putEquipe();
    })
});

/**
 * Ajoute un évenement "click" qui affiche ou cache l'UID du joueur
 */
voirTexte.addEventListener("click", () => {
    inputUID.type = voirOuPasTexte(inputUID.type);
})

/**
 * Ajoute un évenement "input" qui attribuera une certaine valeur à l'attribu UID selon les caracrères entrés par le joueur
 */
inputUID.addEventListener("input", () => {
    UID = inputUID.value;
})

/**
 * Ajoute un évenement "input" qui affecte à couleurChoisi, la couleur sélectionné par le joueur
 */
color.addEventListener("input", () => {
    couleurChoisi = color.value;
})

/**
 * Réupère et affiche un tableau de pixels de couleurs depuis l'API par une méthode GET
 */
const getTabPx = () => {
    // Fait une requete dans l'API
    fetch(`${serveur}/tableau`)
        .then(reponse => {
            if (!reponse.ok) {
                return reponse.json().then(data => {
                    throw new Error(data.error);
                });
            }
            return reponse.json();
        })
        .then(data => {
            // récupère les pixels ligne à ligne dans un tableau 2D (tableauPx)
            for (let ligne of data) {
                const lignePx = document.createElement('tr');
                for (let colonne of ligne) {
                    const colonnePx = document.createElement('td');
                    colonnePx.style.backgroundColor = colonne;
                    lignePx.appendChild(colonnePx);
                    // Ajoute un évenement "click" à chaque pixels et appelle la fonction de modification de pixel au moment du clic
                    colonnePx.addEventListener("click", (event) => {
                        row = lignePx.rowIndex;
                        col = event.target.cellIndex;
                        modifPx();
                    });
                    colonnePx.className = "pixel";
                }
                tableauPx.appendChild(lignePx);
            }
            // Ajoute le tableau dans l'html
            lieu.appendChild(tableauPx);
        })
        // Affiche les éventuelles erreurs dans la console
        .catch(error => {
            console.error(error);
        })
}

/**
 * Envoi une modification du pixel sélectionné dans l'API par une méthode PUT
 */
const modifPx = () => {
    fetch(`${serveur}/modifier-case`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        // Modifie le fichier json afin de remplacer les valeurs récupérés 
        // par les valeurs que le joueur a indiqué
        // (incluant la couleur choisi, l'UID du joueur, et l'emplacement du pixel)
        body: JSON.stringify({
            color: couleurChoisi,
            uid: UID,
            col: col,
            row: row
        })
    })
        // Envoi le fichier json dans l'API après avoir inscrit les modifications
        .then(response => {
            return response.json();
        })
        // Appelle à nouveau le tableau de pixels et le tableau de joueurs 
        // en supprimant les anciens afin de les actualiser
        .then(data => {
            // Indique le message reçu par l'API (sous forme de code) 
            // qui indiquera si tout se passe bien (2XX), s'il y a une erreur (4XX) ou autre
            infoServeur.textContent = data.msg;
            tableauPx.innerHTML = '';
            tableauJoueurs.innerHTML = '';
            getTabPx();
            getJoueurs();
        })
    // Une fois un pixel modifié, appelle une fonction pour indiquer au joueur le temps restant 
    // avant de poser un nouveau pixel et l'affecte dans un attribu
    intervale = setInterval(getTempsAttente, 1000);
}

/**
 * Envoi l'équipe sélectionnée par le joueur dans l'API par une méthode PUT
 */
const putEquipe = () => {
    console.log(equipeChoisi);
    fetch(`${serveur}/choisir-equipe`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        // Modifie le fichier json afin de remplacer les valeurs récupérés 
        // par les valeurs que le joueur a indiqué
        // (incluant l'UID du joueur et l'équipe choisi)
        body: JSON.stringify({
            uid: UID,
            nouvelleEquipe: equipeChoisi
        })
    })
        // Envoi le fichier json dans l'API après avoir inscrit les modifications 
        .then(response => {
            return response.json();
        }).then(data => {
            // Indique le message reçu par l'API (sous forme de code) 
            // qui indiquera si tout se passe bien (2XX), s'il y a une erreur (4XX) ou autre
            infoServeur.textContent = data.msg;
        })
}

/**
 * Récupère la liste des joueurs ayant joués dernièrement et les inscrits dans un tableau prévu à cet effet
 */
const getJoueurs = () => {
    // Fait une requete dans l'API selon l'UID du joueur
    fetch(`${serveur}/liste-joueurs?uid=${UID}`)
        .then(reponse => {
            if (!reponse.ok) {
                return reponse.json().then(data => {
                    throw new Error(data.error);
                });
            }
            return reponse.json();
        })
        .then(data => {
            // Créé et rempli un tableau 2D incluant la date et l'heure à laquelle 
            // les joueurs ont procédé à une modification d'un pixel
            for (let ligne of data) {
                const ligneJoueur = document.createElement('tr');
                const cellNom = document.createElement('td');
                cellNom.textContent = ligne.nom;
                const cellEquipe = document.createElement('td');
                cellEquipe.textContent = ligne.equipe;
                const cellDerniereModif = document.createElement('td');
                // Affiche la date et l'heure d'une manière plus présentable
                cellDerniereModif.textContent = "Le " + new Date(ligne.lastModificationPixel).toLocaleDateString()
                    + " à ";
                cellDerniereModif.textContent += new Date(ligne.lastModificationPixel).toLocaleTimeString();
                const cellBanni = document.createElement('td');
                cellBanni.textContent = ligne.banned;
                ligneJoueur.appendChild(cellNom);
                ligneJoueur.appendChild(cellEquipe);
                ligneJoueur.appendChild(cellDerniereModif);
                ligneJoueur.appendChild(cellBanni);
                tableauJoueurs.appendChild(ligneJoueur);
            };
        })
        .catch(error => {
            console.error(error);
        })
};

/**
 * Récupère le temps d'attente de la possible pose du prochain pixel depuis l'API
 */
const getTempsAttente = () => {
    // Fait une requete à l'API selon L'UID du joueur
    fetch(`${serveur}/temps-attente?uid=${UID}`)
        .then(reponse => {
            if (!reponse.ok) {
                return reponse.json().then(data => {
                    throw new Error(data.error);
                });
            }
            return reponse.json();
        })
        .then(data => {
            // A l'emplacement désiré dans l'html, indique si le joueur peut poser un pixel, 
            // et sinon, le temps qui lui reste avant d'en poser un.
            const tempsAtt = document.getElementById('pixelAttend');
            if ((parseInt(data.tempsAttente / 1000)) === 0) {
                // Remet l'intervale à son état initial
                clearInterval(intervale);
                tempsAtt.textContent = "Vous pouvez à nouveau poser un pixel!";
            }
            else {
                tempsAtt.textContent = "Nouveau pixel disponible dans " + parseInt(data.tempsAttente / 1000) + " secondes.";
            }
        })
        .catch(error => {
            console.error(error);
        })
}

/**
 * Affiche une image (de Kirby) aléatoire via un tableau d'images
 */
function imageAléatoire() {
    const tableauImages = ["KirbyCouteau.jpg", "KirbyGateau.webp", "Kirbytachi.jpg",
        "KirbyCouteauPins.png", "KirbyChokbar.jpg", "KirbyHappyKnife.jpg",
        "KirbyKnifePlush.jpeg", "KirbyKnifeDraw.png", "KirbyKnifeSOHAPPY.jpg",
        "KirbyKnifeBlackBackground.png", "KirbyMIAM.webp",
        "KiRBYcuRSed.webp", "Kirby.gif"]
    let nbAleatoire = getRandomInt(tableauImages.length);
    document.querySelector("img").src = tableauImages[nbAleatoire];
}

/**
 * Fonction qui récupère un nombre aléatoire 
 * entre 0 et la valeur passé en paramètre (max) -1
 * 
 * @param {int} max entier maximum (+1) que l'on souhaite récupérer
 * @returns Un nombre aléatoire entre 0 et max-1
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Fonction qui change montre le texte s'il est caché et inversement
 * 
 * @param {string} texte la chaine de caractère que l'on souhaite étudier
 * @returns retourne le type que la chaine de caractère est sencée prendre
 */
function voirOuPasTexte(texte) {
    if (texte == "password")
        return "text";
    else
        return "password";
}


// Appel des fonctions

// Appelle (pour la première fois) la fonction qui 
// affiche le tableau de pixels récupéré dans l'API
getTabPx();

// Appelle la fonction qui affiche une image aléatoire (de Kirby)
// afin d'ornementer le site de la plus belle manière qui soit 
// toutes les 10 secondes
imageAléatoire();
setInterval(imageAléatoire, 3 * 1000);