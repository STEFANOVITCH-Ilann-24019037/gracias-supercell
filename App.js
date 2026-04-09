import { StatusBar } from 'expo-status-bar';
import { Text, View, Button, Pressable, Modal, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { loadPlayersData, getPlayersData, loadPlayerFromJSON } from './src/services/playersDataService';
import { LoginScreen } from './src/screens/LoginScreen';
import { BrawlersScreen } from './src/screens/BrawlersScreen';
import { PlayerSearchScreen } from './src/screens/PlayerSearchScreen';
import { VersusScreen } from './src/screens/VersusScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

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

    return JSON.parse(raw);
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
    // Load player data in the background after login.
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
   * Loads the remote brawler list and switches the active tab to brawlers.
   * @returns {Promise<void>} A promise that resolves after the list is loaded.
   */
  const fetchBrawlers = async () => {
    setLoading(true);
    setActiveTab('brawlers');

    try {
      // Load brawler data through the remote service.
      const data = getPlayersData() || (await loadPlayersData());
      const brawlersData = data.brawlers?.items || [];
      console.log('Brawlers loaded:', brawlersData.length);
      setBrawlers(brawlersData);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Looks up a player from the remote JSON endpoint and opens the player tab.
   * @returns {Promise<void>} A promise that resolves after the lookup finishes.
   */
  const fetchPlayer = async () => {
    if (!playerTag.trim()) {
      alert('Please enter a player hashtag');
      return;
    }

    setLoading(true);
    setActiveTab('player');
    setPlayerData(null);

    try {
      const playerData = await loadPlayerFromJSON(playerTag);

      if (!playerData) {
        alert('Player not found. Check the hashtag and try again.');
        return;
      }

      console.log('Player loaded:', playerData.name);
      setPlayerData(playerData);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
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
      alert('Please enter the opponent hashtag');
      return;
    }

    setLoading(true);
    setActiveTab('versus');
    setVersusPlayer1(null);
    setVersusPlayer2(null);

    try {
      const player1 = getCurrentUserVersusPlayer();
      const player2 = await loadPlayerFromJSON(versusOpponentTag);

      if (!player1 || !player2) {
        alert('Player not found. Try a valid tag such as #QLVP829R or #VU02GGJQ.');
        return;
      }

      if (player1.tag === player2.tag) {
        alert('Please select two different players.');
        return;
      }

      setVersusPlayer1(player1);
      setVersusPlayer2(player2);
      console.log('Versus loaded:', player1.name, 'vs', player2.name);
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
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
        <Pressable
          onPress={() => setActiveTab('brawlers')}
          style={({ pressed }) => [styles.tabButton, activeTab === 'brawlers' && styles.tabButtonActive, pressed && styles.tabButtonPressed]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'brawlers' && styles.tabButtonTextActive]}>Brawlers</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('player')}
          style={({ pressed }) => [styles.tabButton, activeTab === 'player' && styles.tabButtonActive, pressed && styles.tabButtonPressed]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'player' && styles.tabButtonTextActive]}>Joueur</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('versus')}
          style={({ pressed }) => [styles.tabButton, activeTab === 'versus' && styles.tabButtonActive, pressed && styles.tabButtonPressed]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'versus' && styles.tabButtonTextActive]}>Versus</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('profile')}
          style={({ pressed }) => [styles.tabButton, activeTab === 'profile' && styles.tabButtonActive, pressed && styles.tabButtonPressed]}
        >
          <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.tabButtonTextActive]}>Profil</Text>
        </Pressable>
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
