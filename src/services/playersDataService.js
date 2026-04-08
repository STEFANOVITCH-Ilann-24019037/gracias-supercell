// Service pour charger les données des joueurs
// Importe directement depuis dataExport (fonctionne en Web et React Native)

import { brawlersData, playersDataMap } from '../../data/api/dataExport';

let playersData = null;

/**
 * Charge les données des joueurs
 * @returns {Promise<Object>} Les données des joueurs
 */
export const loadPlayersData = async () => {
  if (playersData) {
    return playersData;
  }

  try {
    // Les données sont déjà importées au-dessus
    playersData = {
      brawlers: brawlersData || { items: [] },
      player1: playersDataMap?.QLVP829R || {},
      player2: playersDataMap?.VU02GGJQ || {},
      playersMap: playersDataMap || {},
    };

    console.log('✅ Données des joueurs chargées avec succès');
    console.log(`   Brawlers: ${brawlersData?.items?.length || 0}`);
    return playersData;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des données des joueurs:', error.message);
    // Retourner des données vides en cas d'erreur
    return { brawlers: { items: [] }, player1: {}, player2: {}, playersMap: {} };
  }
};

/**
 * Récupère les données déjà chargées
 * @returns {Object} Les données des joueurs ou null si pas encore chargées
 */
export const getPlayersData = () => {
  return playersData;
};

/**
 * Réinitialise le cache des données
 */
export const resetPlayersData = () => {
  playersData = null;
};

