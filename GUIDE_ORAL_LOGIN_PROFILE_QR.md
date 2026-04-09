# Guide oral - Login, Profile, QR

## 1. Vue d'ensemble

Cette partie du projet gere trois choses :
- la connexion de l'utilisateur a partir d'un fichier JSON local
- la page profil avec les statistiques du joueur connecte
- le QR code pour partager le tag joueur et le scanner pour remplir automatiquement un adversaire

Le flux general est :
1. l'utilisateur se connecte via `LoginScreen`
2. `App.js` stocke l'utilisateur connecte dans `currentUser`
3. `ProfileScreen` affiche les donnees du compte, le QR code et l'option de scan
4. le scanner QR renvoie le tag du joueur vers le mode `versus`

## 2. Connexion

### Fichier principal
- [src/screens/LoginScreen.js](src/screens/LoginScreen.js)

### Role
L'ecran de login demande un email et un mot de passe, puis cherche si un utilisateur correspond dans `data/account/users.json`.

### Logique
- `useState` stocke `email`, `password` et le message d'erreur
- `handleLogin()` nettoie les valeurs avec `trim()` et met l'email en minuscules
- si les deux champs sont vides, un message d'erreur est affiche
- si un utilisateur est trouve avec `find()`, il est renvoye vers `App.js` via `onLoginSuccess()`
- la copie `JSON.parse(JSON.stringify(foundUser))` evite de partager la meme reference objet

### Phrase a dire a l'oral
"La connexion est locale et basee sur un fichier JSON. Je verifie l'email et le mot de passe, puis si l'utilisateur existe, je transmets ses donnees au composant principal."

### Point important a expliquer si on te le demande
Ce n'est pas une vraie authentification serveur. C'est une simulation pour un projet mobile, avec des donnees locales.

## 3. Gestion globale de la session

### Fichier principal
- [App.js](App.js)

### Role
`App.js` centralise toute la navigation logique de l'application et garde en memoire l'utilisateur connecte.

### Logique importante
- `currentUser` contient l'utilisateur connecte
- `restoreUserSession()` relit la session depuis `sessionStorage`
- `persistUserSession()` enregistre l'utilisateur apres connexion
- `clearUserSession()` supprime la session a la deconnexion
- `handleLoginSuccess()` met a jour `currentUser` puis sauvegarde la session
- `handleLogout()` remet `currentUser` a `null` et efface la session

### Phrase a dire a l'oral
"J'ai choisi de centraliser l'etat de connexion dans App.js pour que toutes les pages partagent le meme utilisateur et que la session puisse etre restauree au rechargement."

## 4. Page profil

### Fichier principal
- [src/screens/ProfileScreen.js](src/screens/ProfileScreen.js)

### Role
La page profil affiche toutes les informations du compte connecte : identite, tag joueur, email, statistiques, club, radar de performance, QR code et partage en PNG.

### Elements affiches
- nom et prenom
- email
- `player_tag`
- `id` du compte
- statistiques principales : trophées, niveau, prestige, victoires 3v3, solo, duo
- club si disponible
- graphique radar pour visualiser le profil
- bouton pour afficher le QR code
- bouton pour ouvrir le scanner QR
- bouton pour partager le profil en image PNG

### Pourquoi le profil est riche
L'objectif n'est pas juste d'afficher un compte, mais de donner une vue complete et plus visuelle du joueur. Le radar chart sert a rendre les statistiques plus lisibles qu'une simple liste.

### Phrase a dire a l'oral
"La page profil est la page centrale de mon travail. Elle resume le compte connecte, ses statistiques Brawl Stars et ses outils de partage."

## 5. QR code

### Generation du QR code
- dans [src/screens/ProfileScreen.js](src/screens/ProfileScreen.js#L405) la modal QR s'ouvre avec `showQrModal`
- le QR est genere avec `react-native-qrcode-svg`
- la valeur encodee est `currentUser.player_tag`

### But
Le QR code permet de partager rapidement le tag du joueur sans le retaper manuellement.

### Phrase a dire a l'oral
"Le QR code encode simplement le tag du joueur. Le but est de simplifier le partage du profil et d'eviter les erreurs de saisie."

## 6. Scan QR et mode Versus

### Fichier principal
- [App.js](App.js)

### Logique
- le bouton "Scanner un QR" dans le profil appelle `onOpenQrScanner`
- `openQrScanner()` demande d'abord la permission camera avec `expo-camera`
- si la permission est refusee, une alerte explique pourquoi le scan ne peut pas demarrer
- `CameraView` lit uniquement les QR codes
- `handleQrScanned()` recupere les donnees lues, les nettoie avec `normalizeScannedTag()` et les met dans `versusOpponentTag`
- l'application bascule ensuite automatiquement sur l'onglet `versus`

### Pourquoi `scannerLocked` existe
Quand un QR est detecte, on verrouille temporairement le scanner pour eviter que la camera lise plusieurs fois le meme code en rafale.

### Phrase a dire a l'oral
"Le scanner QR sert a remplir automatiquement le joueur a comparer. Je controle la permission camera, puis je lis le tag et je l'envoie directement dans le mode versus."

## 7. Questions probables et reponses

### Question 1 : Pourquoi avoir utilise un JSON local pour la connexion ?
Reponse : parce que c'est plus simple pour un projet scolaire et que cela permet de simuler un systeme de compte sans backend.

### Question 2 : Ou est stocke l'utilisateur connecte ?
Reponse : dans l'etat `currentUser` de `App.js`, avec une sauvegarde dans `sessionStorage` pour garder la session apres rechargement.

### Question 3 : Pourquoi copier l'objet utilisateur avec JSON ?
Reponse : pour eviter de modifier directement l'objet venant du tableau JSON partage en memoire.

### Question 4 : Comment le QR code fonctionne-t-il ?
Reponse : il encode le tag joueur. Quand on le scanne, on extrait le tag puis on l'utilise dans le mode `versus`.

### Question 5 : Pourquoi demander la permission camera ?
Reponse : parce que la lecture du QR code necessite l'acces a la camera, et l'application doit gerer le refus proprement.

### Question 6 : Pourquoi utiliser un modal pour le QR ?
Reponse : pour garder la page profil visible tout en affichant le QR code de maniere ponctuelle et propre.

### Question 7 : Pourquoi la page profil contient-elle autant d'infos ?
Reponse : parce qu'elle doit servir de resume complet du compte, pas seulement d'ecran d'identification.

### Question 8 : Quelle est la difference entre login et profil ?
Reponse : le login sert a identifier l'utilisateur, tandis que le profil affiche ses donnees et ses actions apres connexion.

## 8. Point de vigilance si on te pousse techniquement

- ce n'est pas securise comme une vraie authentification
- les mots de passe sont en clair dans le JSON, donc ce n'est pas acceptable pour une production
- la session utilise `sessionStorage`, donc c'est adapte surtout au web / environnements compatibles
- le scanner QR depend des permissions camera et du support du device

## 9. Version courte a reciter

"J'ai developpe la partie compte avec une connexion locale basee sur un fichier JSON. Une fois connecte, l'utilisateur arrive sur la page profil, qui affiche ses informations, ses statistiques et un QR code contenant son tag joueur. J'ai aussi ajoute un scanner QR qui permet de recuperer ce tag automatiquement pour le mode versus. Le tout est centralise dans App.js, qui gere la session, la navigation et le passage entre les ecrans."
