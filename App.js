import { StatusBar } from 'expo-status-bar';
import { Text, View, Button, Pressable, Modal, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { loadPlayersData, getPlayersData } from './src/services/playersDataService';
import { LoginScreen } from './src/screens/LoginScreen';
import { BrawlersScreen } from './src/screens/BrawlersScreen';
import { PlayerSearchScreen } from './src/screens/PlayerSearchScreen';
import { VersusScreen } from './src/screens/VersusScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import usersData from './data/account/users.json';
import apiPlayer1 from './data/api/apiQLVP829Rplayer.json';
import apiPlayer2 from './data/api/apiVU02GGJQplayer.json';
import apiRQPOQOQplayer from './data/api/apiRQPOQOQplayer.json';
import api2PVJU20JQplayer from './data/api/api2PVJU20JQplayer.json';
import api2UVJJPQLGPplayer from './data/api/api2UVJJPQLGPplayer.json';
import apilgoqjvr2uplayer from './data/api/apilgoqjvr2uplayer.json';

/**
 * Player lookup table used for local hashtag searches.
 * @type {Record<string, unknown>}
 */
const playersList = {
  QLVP829R: apiPlayer1,
  VU02GGJQ: apiPlayer2,
  RQPOQOQ: apiRQPOQOQplayer,
  '2PVJU20JQ': api2PVJU20JQplayer,
  '2UVJJPQLGP': api2UVJJPQLGPplayer,
  LGOQJVR2UP: apilgoqjvr2uplayer,
};

/**
 * Load a player from the centralized lookup list.
 * @param {string} playerTag - Player hashtag with or without the leading #.
 * @returns {Object|null} The resolved player data, or null when not found.
 */
const loadPlayerFromJSON = (playerTag) => {
  const tag = playerTag.replace('#', '').toUpperCase();

  try {
    if (playersList[tag]) {
      console.log('Player loaded:', tag);
      return playersList[tag];
    }

    console.error(`Player ${tag} not found`);
    return null;
  } catch (error) {
    console.error(`Error: Unable to load player ${tag}`, error.message);
    return null;
  }
};

/**
 * Storage key used to persist the connected user in sessionStorage.
 * @type {string}
 */
const SESSION_USER_KEY = 'gracias-supercell.currentUser';

/**
 * Restores the previously connected user from sessionStorage.
 * @returns {Object|null} The restored user, or null when no session exists.
 */
const restoreUserSession = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_USER_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const matchedUser = usersData.find(
      (user) => user.id === parsed?.id || user.email?.toLowerCase() === parsed?.email?.toLowerCase()
    );

    return matchedUser || parsed;
  } catch (error) {
    return null;
  }
};

/**
 * Persists the connected user in sessionStorage.
 * @param {Object} user - Connected user payload.
 * @returns {void}
 */
const persistUserSession = (user) => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }

  try {
    window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch (error) {
    // Ignore storage errors to avoid blocking app usage.
  }
};

/**
 * Removes the connected user from sessionStorage.
 * @returns {void}
 */
const clearUserSession = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }

  try {
    window.sessionStorage.removeItem(SESSION_USER_KEY);
  } catch (error) {
    // Ignore storage errors to avoid blocking app usage.
  }
};

/**
 * Root application component responsible for authentication, session state,
 * tab navigation, and the global QR scanner modal.
 * @returns {JSX.Element} The application shell.
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brawlers, setBrawlers] = useState([]);
  const [playerTag, setPlayerTag] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [activeTab, setActiveTab] = useState('brawlers'); // 'brawlers', 'player', or 'versus'
  const [versusOpponentTag, setVersusOpponentTag] = useState('');
  const [versusPlayer1, setVersusPlayer1] = useState(null);
  const [versusPlayer2, setVersusPlayer2] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerLocked, setScannerLocked] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    const savedUser = restoreUserSession();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  /**
   * Handles a successful login, stores the user session, and loads shared data.
   * @param {Object} user - Authenticated user payload.
   * @returns {void}
   */
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    // Load player data on startup.
    loadPlayersData().catch(error => {
      console.error('Error while loading initial data:', error);
    });
    persistUserSession(user);
  };

  /**
   * Logs out the current user and clears the session cache.
   * @returns {void}
   */
  const handleLogout = () => {
    setCurrentUser(null);
    clearUserSession();
  };

  /**
   * Builds the local player payload used in the versus screen.
   * @returns {Object|null} The connected user payload formatted for versus mode.
   */
  const getCurrentUserVersusPlayer = () => {
    if (!currentUser) {
      return null;
    }

    return {
      ...currentUser.playerStats,
      name: currentUser.playerStats?.name || `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim(),
      tag: currentUser.player_tag,
    };
  };

  /**
   * Normalizes a scanned QR payload into a valid player hashtag.
   * @param {unknown} value - Raw scanned QR payload.
   * @returns {string|null} A normalized hashtag, or null when invalid.
   */
  const normalizeScannedTag = (value) => {
    const rawValue = String(value || '').trim().toUpperCase();
    if (!rawValue) {
      return null;
    }

    const match = rawValue.match(/#?[A-Z0-9]+/);
    if (!match) {
      return null;
    }

    return match[0].startsWith('#') ? match[0] : `#${match[0]}`;
  };

  /**
   * Requests camera permission and opens the QR scanner when allowed.
   * @returns {Promise<void>} A promise that resolves after the permission flow.
   */
  const openQrScanner = async () => {
    const permission = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();

    if (!permission?.granted) {
      Alert.alert('Permission caméra', 'Autorise la caméra pour scanner un QR code.');
      return;
    }

    setScannerLocked(false);
    setScannerVisible(true);
  };

  /**
   * Handles a scanned QR code and forwards the resulting hashtag to versus mode.
   * @param {Object} event - Camera barcode event.
   * @param {string} event.data - Raw QR payload.
   * @returns {void}
   */
  const handleQrScanned = ({ data }) => {
    if (scannerLocked) {
      return;
    }

    const scannedTag = normalizeScannedTag(data);
    if (!scannedTag) {
      Alert.alert('QR invalide', 'Le QR code scanné ne contient pas de hashtag valide.');
      setScannerVisible(false);
      return;
    }

    setScannerLocked(true);
    setScannerVisible(false);
    setVersusPlayer1(null);
    setVersusPlayer2(null);
    setVersusOpponentTag(scannedTag);
    setActiveTab('versus');
    Alert.alert('QR code lu', `Hashtag ajouté : ${scannedTag}`);
  };

  if (!currentUser) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  /**
   * Loads the local brawler list and switches the active tab to brawlers.
   * @returns {Promise<void>} A promise that resolves after the list is loaded.
   */
  const fetchBrawlers = async () => {
    setLoading(true);
    setActiveTab('brawlers');

    try {
      // Load brawler data through the service.
      const data = getPlayersData() || (await loadPlayersData());
      const brawlersData = data.brawlers?.items || [];
      console.log('Brawlers loaded:', brawlersData.length);
      setBrawlers(brawlersData);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Looks up a player from the local JSON files and opens the player tab.
   * @returns {Promise<void>} A promise that resolves after the lookup finishes.
   */
  const fetchPlayer = async () => {
    if (!playerTag.trim()) {
      alert('Veuillez entrer un hashtag de joueur');
      return;
    }

    setLoading(true);
    setActiveTab('player');

    try {
      // Load the player from the local JSON files.
      const playerData = loadPlayerFromJSON(playerTag);

      if (!playerData) {
        alert('Joueur introuvable. Vérifiez le hashtag.');
        setLoading(false);
        return;
      }

      console.log('Player loaded:', playerData.name);
      setPlayerData(playerData);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resolves both players needed for the versus comparison and updates state.
   * @returns {Promise<void>} A promise that resolves after the comparison inputs are prepared.
   */
  const fetchVersus = async () => {
    if (!versusOpponentTag.trim()) {
      alert('Veuillez entrer le hashtag du joueur à comparer');
      return;
    }

    setLoading(true);
    setActiveTab('versus');

    try {
      const player1 = getCurrentUserVersusPlayer();
      const player2 = loadPlayerFromJSON(versusOpponentTag);

      if (!player1 || !player2) {
        alert('Joueur introuvable. Tags valides: #QLVP829R ou #VU02GGJQ');
        setLoading(false);
        return;
      }

      if (player1.tag === player2.tag) {
        alert('Veuillez sélectionner deux joueurs différents');
        setLoading(false);
        return;
      }

      setVersusPlayer1(player1);
      setVersusPlayer2(player2);
      console.log('Versus loaded:', player1.name, 'vs', player2.name);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Brawl Stars</Text>
        <View style={styles.userBar}>
          <View style={styles.userIdentityCard}>
            <View style={styles.userIconWrap}>
              <MaterialCommunityIcons name="account-circle" size={24} color="#00ff00" />
            </View>
            <View style={styles.userIdentityTextBlock}>
              <Text style={styles.userNameText}>{currentUser.prenom || 'Utilisateur'} {currentUser.nom || ''}</Text>
              <View style={styles.userTagPill}>
                <MaterialCommunityIcons name="tag-outline" size={12} color="#FFD8CC" />
                <Text style={styles.userTagText}>{currentUser.player_tag || '-'}</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={18} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Button
          title="Brawlers"
          onPress={() => setActiveTab('brawlers')}
          color={activeTab === 'brawlers' ? '#00ff00' : '#666'}
        />
        <Button
          title="Joueur"
          onPress={() => setActiveTab('player')}
          color={activeTab === 'player' ? '#00ff00' : '#666'}
        />
        <Button
          title="Versus"
          onPress={() => setActiveTab('versus')}
          color={activeTab === 'versus' ? '#00ff00' : '#666'}
        />
        <Button
          title="Profil"
          onPress={() => setActiveTab('profile')}
          color={activeTab === 'profile' ? '#00ff00' : '#666'}
        />
      </View>

      {/* Brawlers tab */}
      {activeTab === 'brawlers' && (
        <BrawlersScreen
          brawlers={brawlers}
          loading={loading}
          onLoadBrawlers={fetchBrawlers}
        />
      )}

      {/* Player tab */}
      {activeTab === 'player' && (
        <PlayerSearchScreen
          playerTag={playerTag}
          onPlayerTagChange={setPlayerTag}
          loading={loading}
          onSearchPlayer={fetchPlayer}
          playerData={playerData}
        />
      )}

      {/* Versus tab */}
      {activeTab === 'versus' && (
        <VersusScreen
          currentUser={currentUser}
          versusOpponentTag={versusOpponentTag}
          onVersusOpponentTagChange={setVersusOpponentTag}
          loading={loading}
          onComparePlayers={fetchVersus}
          versusPlayer1={versusPlayer1}
          versusPlayer2={versusPlayer2}
        />
      )}

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <ProfileScreen currentUser={currentUser} onLogout={handleLogout} onOpenQrScanner={openQrScanner} />
      )}

      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.scannerModalContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scanner un QR code</Text>
            <Pressable onPress={() => setScannerVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text style={styles.scannerSubtitle}>
            Pointez la caméra sur le QR du profil pour remplir le joueur 2.
          </Text>

          <View style={styles.scannerCameraBox}>
            <CameraView
              style={styles.scannerCamera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scannerLocked ? undefined : handleQrScanned}
            />
          </View>

          <Pressable
            style={styles.scannerCancelButton}
            onPress={() => setScannerVisible(false)}
          >
            <Text style={styles.scannerCancelText}>Fermer</Text>
          </Pressable>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}
