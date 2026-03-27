# Gracias-Supercell

Une application React Native avec Expo pour accéder à l'API Brawl Stars.

## Problèmes résolus

### 1. Erreur 500 du serveur Expo
**Cause** : Structure de projet incohérente avec des `package.json` conflictifs
**Solution** : 
- Consolidé tous les dépendances au niveau racine
- Créé un `app.json` au niveau racine
- Créé un point d'entrée `index.js` au niveau racine

### 2. Erreur MIME type (application/json au lieu de JavaScript)
**Cause** : Import de `brawlstars-api-nodejs` qui est une bibliothèque Node.js côté serveur, incompatible avec React Native Web
**Solution** :
- Supprimé la dépendance `brawlstars-api-nodejs`
- Remplacé par des appels `fetch()` HTTP directs qui fonctionnent dans le navigateur

## Installation

```bash
npm install
```

## Démarrage

**⚠️ Important** : Toutes les commandes doivent être exécutées depuis la **racine du projet** (pas depuis `Gracias-Supercell/`) :

```bash
cd /Users/ilannstefanovitch/git/gracias-supercell
```

### Web
```bash
npm run web
```

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## Structure du projet

```
gracias-supercell/
├── app.json (configuration Expo)
├── index.js (point d'entrée)
├── package.json (dépendances)
├── Gracias-Supercell/
│   ├── App.js (composant principal)
│   ├── app.json (configuration locale)
│   ├── index.js (point d'entrée local)
│   ├── package.json
│   └── assets/ (images)
```

## Utilisation

L'application appelle l'API Brawl Stars en utilisant le token JWT fourni. Cliquez sur le bouton "Envoyer" pour récupérer les données du joueur.

### ⚠️ Note importante sur la sécurité
**Le token JWT est actuellement visible dans le code source.** Pour une application en production :
1. Stockez le token dans une variable d'environnement
2. Créez un backend intermédiaire pour faire les appels API
3. Utilisez Expo Secrets pour les builds EAS

## Technologies utilisées

- React Native 0.83.2
- Expo 55.0.8
- React 19.2.0
- React Native Web 0.21.0
