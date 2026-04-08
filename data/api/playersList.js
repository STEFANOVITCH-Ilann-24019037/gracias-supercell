/**
 * playersList.js - AUTO-GÉNÉRÉ
 * 
 * ⚠️ GÉNÉRATION AUTOMATIQUE - NE PAS MODIFIER!
 * 
 * Pour ajouter un joueur:
 * 1. Créer: data/api/api + TAG + player.json
 * 2. Ajouter dans playersConfig.json
 * 3. EXÉCUTER: npm run sync-players
 * 
 * C'est tout!
 */

import playersConfig from './playersConfig.json';

// AUTO-IMPORT: Tous les fichiers joueurs sont importés ici
// Cette section est régénérée automatiquement
import apiQLVP829Rplayer from './apiQLVP829Rplayer.json';
import apiVU02GGJQplayer from './apiVU02GGJQplayer.json';
import apiRQPOQOQplayer from './apiRQPOQOQplayer.json';
import api2PVJU20JQplayer from './api2PVJU20JQplayer.json';
import api2UVJJPQLGPplayer from './api2UVJJPQLGPplayer.json';

/**
 * Dictionnaire AUTO-GÉNÉRÉ de tous les joueurs
 */
const allImports = {
  'apiQLVP829Rplayer.json': apiQLVP829Rplayer,
  'apiVU02GGJQplayer.json': apiVU02GGJQplayer,
  'apiRQPOQOQplayer.json': apiRQPOQOQplayer,
  'api2PVJU20JQplayer.json': api2PVJU20JQplayer,
  'api2UVJJPQLGPplayer.json': api2UVJJPQLGPplayer,
};

/**
 * Charge la liste des joueurs depuis playersConfig.json
 * Les joueurs dans playersConfig.json sont automatiquement détectés
 */
const buildPlayersList = () => {
  const playersList = {};
  
  if (!playersConfig.players) {
    console.error('playersConfig.json invalide - pas de clé "players"');
    return playersList;
  }
  
  playersConfig.players.forEach(player => {
    if (!player.filename) {
      console.warn(`Joueur ${player.tag} n'a pas de filename dans playersConfig.json`);
      return;
    }
    
    if (allImports[player.filename]) {
      playersList[player.tag] = allImports[player.filename];
      console.log(`✅ Joueur chargé: ${player.tag}`);
    } else {
      console.warn(`⚠️  Fichier ${player.filename} non trouvé - vérifiez playersConfig.json`);
    }
  });
  
  return playersList;
};

export default buildPlayersList();
