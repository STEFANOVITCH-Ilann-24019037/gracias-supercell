import { StatusBar } from 'expo-status-bar';
import { Text, View, Button, ScrollView, FlatList, ActivityIndicator, TextInput, Pressable, Modal, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Importer les données JSON locales
import apiBrawlers from './data/api/apibrawlers.json';
import apiPlayer1 from './data/api/apipalyer1.json';
import apiPlayer2 from './data/api/apiplayer2.json';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';


/**
 * Charge un joueur depuis la liste centralisée
 */
const loadPlayerFromJSON = (playerTag) => {
  const tag = playerTag.replace('#', '').toUpperCase();

  try {
    // Chercher dans la liste des joueurs
    if (playersList[tag]) {
      console.log('Joueur chargé:', tag);
      return playersList[tag];
    }

    console.error(`Joueur ${tag} non trouvé`);
    return null;
  } catch (error) {
    console.error(`Erreur: Impossible de charger le joueur ${tag}`, error.message);
    return null;
  }
};

const SESSION_USER_KEY = 'gracias-supercell.currentUser';

const restoreUserSession = () => {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

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

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brawlers, setBrawlers] = useState([]);
  const [playerTag, setPlayerTag] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [activeTab, setActiveTab] = useState('brawlers'); // 'brawlers', 'player' ou 'versus'
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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    persistUserSession(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearUserSession();
  };

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

  const openQrScanner = async () => {
    const permission = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();

    if (!permission?.granted) {
      Alert.alert('Permission caméra', 'Autorise la caméra pour scanner un QR code.');
      return;
    }

    setScannerLocked(false);
    setScannerVisible(true);
  };

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

  const fetchBrawlers = async () => {
    setLoading(true);
    setActiveTab('brawlers');

    try {
      // Charger les données des brawlers depuis le JSON local
      console.log('Brawlers chargés:', apiBrawlers.items?.length || 0);
      setBrawlers(apiBrawlers.items || []);
    } catch (error) {
      console.error('Erreur:', error.message);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayer = async () => {
    if (!playerTag.trim()) {
      alert('Veuillez entrer un hashtag de joueur');
      return;
    }

    setLoading(true);
    setActiveTab('player');

    try {
      // Charger le joueur depuis les fichiers JSON
      const playerData = loadPlayerFromJSON(playerTag);

      if (!playerData) {
        alert('Joueur introuvable. Vérifiez le hashtag.');
        setLoading(false);
        return;
      }

      console.log('Joueur chargé:', playerData.name);
      setPlayerData(playerData);
    } catch (error) {
      console.error('Erreur:', error.message);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      console.log('Versus chargé:', player1.name, 'vs', player2.name);
    } catch (error) {
      console.error('Erreur:', error.message);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBrawlerCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.brawlerName}>{item.name}</Text>
        <Text style={styles.brawlerId}>#{item.id}</Text>
      </View>

      <View style={styles.statsContainer}>
        {item.starPowers && item.starPowers.length > 0 && (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Star Powers</Text>
            <Text style={styles.statValue}>{item.starPowers.length}</Text>
          </View>
        )}
        {item.gadgets && item.gadgets.length > 0 && (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gadgets</Text>
            <Text style={styles.statValue}>{item.gadgets.length}</Text>
          </View>
        )}
        {item.gears && item.gears.length > 0 && (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gears</Text>
            <Text style={styles.statValue}>{item.gears.length}</Text>
          </View>
        )}
      </View>

      {item.starPowers && item.starPowers.length > 0 && (
        <View style={styles.abilitiesSection}>
          <Text style={styles.sectionTitle}>Star Powers:</Text>
          {item.starPowers.map((power, idx) => (
            <Text key={idx} style={styles.abilityText}>• {power.name}</Text>
          ))}
        </View>
      )}

      {item.gadgets && item.gadgets.length > 0 && (
        <View style={styles.abilitiesSection}>
          <Text style={styles.sectionTitle}>Gadgets:</Text>
          {item.gadgets.map((gadget, idx) => (
            <Text key={idx} style={styles.abilityText}>• {gadget.name}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderPlayerCard = () => {
    if (!playerData) return null;

    return (
      <ScrollView style={styles.playerCardScroll}>
        <View style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <Text style={styles.playerName}>{playerData.name}</Text>
            <Text style={styles.playerTag}>{playerData.tag}</Text>
          </View>

          <View style={styles.playerStatsGrid}>
            <View style={styles.playerStatBox}>
              <Text style={styles.playerStatLabel}>Trophées</Text>
              <Text style={styles.playerStatValue}>{playerData.trophies}</Text>
            </View>
            <View style={styles.playerStatBox}>
              <Text style={styles.playerStatLabel}>Max Trophées</Text>
              <Text style={styles.playerStatValue}>{playerData.highestTrophies}</Text>
            </View>
            <View style={styles.playerStatBox}>
              <Text style={styles.playerStatLabel}>Niveau</Text>
              <Text style={styles.playerStatValue}>{playerData.expLevel}</Text>
            </View>
            <View style={styles.playerStatBox}>
              <Text style={styles.playerStatLabel}>Brawlers</Text>
              <Text style={styles.playerStatValue}>{playerData.brawlers?.length || 0}</Text>
            </View>
          </View>

          <View style={styles.playerDetailSection}>
            <Text style={styles.sectionTitle}>Informations Générales</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prestige Total</Text>
              <Text style={styles.detailValue}>{playerData.totalPrestigeLevel || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Points XP</Text>
              <Text style={styles.detailValue}>{playerData.expPoints?.toLocaleString() || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Victoires 3v3</Text>
              <Text style={styles.detailValue}>{playerData['3vs3Victories']?.toLocaleString() || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Victoires Solo</Text>
              <Text style={styles.detailValue}>{playerData.soloVictories?.toLocaleString() || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Victoires Duo</Text>
              <Text style={styles.detailValue}>{playerData.duoVictories?.toLocaleString() || '-'}</Text>
            </View>
          </View>

          {playerData.club && (
            <View style={styles.playerDetailSection}>
              <Text style={styles.sectionTitle}>Club</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nom</Text>
                <Text style={styles.detailValue}>{playerData.club.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tag</Text>
                <Text style={styles.detailValue}>{playerData.club.tag}</Text>
              </View>
            </View>
          )}

          {playerData.brawlers && playerData.brawlers.length > 0 && (
            <View style={styles.playerBrawlersSection}>
              <Text style={styles.sectionTitle}>Top Brawlers</Text>
              {playerData.brawlers.slice(0, 10).map((brawler, idx) => (
                <View key={idx} style={styles.playerBrawlerItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playerBrawlerName}>{brawler.name}</Text>
                    <Text style={{ fontSize: 10, color: '#888' }}>Rang {brawler.rank} - Prestige {brawler.prestigeLevel}</Text>
                  </View>
                  <View style={styles.playerBrawlerStats}>
                    <Text style={styles.playerBrawlerTrophy}>{brawler.trophies}</Text>
                    <Text style={styles.playerBrawlerLevel}>Lvl {brawler.power}</Text>
                  </View>
                </View>
              ))}
              {playerData.brawlers.length > 10 && (
                <Text style={{ fontSize: 12, color: '#FF6B35', fontStyle: 'italic', marginTop: 8, textAlign: 'center' }}>+{playerData.brawlers.length - 10} autres...</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderVersusComparison = () => {
    if (!versusPlayer1 || !versusPlayer2) return null;

    const stats1 = {
      trophies: versusPlayer1.trophies || 0,
      maxTrophies: versusPlayer1.highestTrophies || 0,
      level: versusPlayer1.expLevel || 0,
      brawlers: versusPlayer1.brawlers?.length || 0,
      prestigeTotal: versusPlayer1.totalPrestigeLevel || 0,
      victories3v3: versusPlayer1['3vs3Victories'] || 0,
      victorieSolo: versusPlayer1.soloVictories || 0,
      victorieDuo: versusPlayer1.duoVictories || 0,
    };

    const stats2 = {
      trophies: versusPlayer2.trophies || 0,
      maxTrophies: versusPlayer2.highestTrophies || 0,
      level: versusPlayer2.expLevel || 0,
      brawlers: versusPlayer2.brawlers?.length || 0,
      prestigeTotal: versusPlayer2.totalPrestigeLevel || 0,
      victories3v3: versusPlayer2['3vs3Victories'] || 0,
      victorieSolo: versusPlayer2.soloVictories || 0,
      victorieDuo: versusPlayer2.duoVictories || 0,
    };

    const ComparisonStat = ({ label, stat1, stat2 }) => {
      const winner = stat1 > stat2 ? 1 : stat2 > stat1 ? 2 : 0;
      return (
        <View style={styles.comparisonStat}>
          <View style={[styles.statColumn, winner === 1 && { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.comparisonValue}>{stat1}</Text>
          </View>
          <Text style={styles.comparisonLabel}>{label}</Text>
          <View style={[styles.statColumn, winner === 2 && { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.comparisonValue}>{stat2}</Text>
          </View>
        </View>
      );
    };

    const MiniGraphRow = ({ label, leftValue, rightValue }) => {
      const maxValue = Math.max(leftValue, rightValue, 1);
      const leftWidth = `${Math.max(8, (leftValue / maxValue) * 100)}%`;
      const rightWidth = `${Math.max(8, (rightValue / maxValue) * 100)}%`;

      return (
        <View style={styles.quickGraphRow}>
          <Text style={styles.quickGraphLabel}>{label}</Text>
          <View style={styles.quickGraphBars}>
            <View style={styles.quickGraphBarWrap}>
              <View style={[styles.quickGraphBar, styles.quickGraphBarLeft]}>
                <View style={[styles.quickGraphBarFill, { width: leftWidth }]} />
              </View>
              <Text style={styles.quickGraphBarValue}>{leftValue.toLocaleString('fr-FR')}</Text>
            </View>

            <View style={styles.quickGraphBarWrap}>
              <View style={[styles.quickGraphBar, styles.quickGraphBarRight]}>
                <View style={[styles.quickGraphBarFill, styles.quickGraphBarFillRight, { width: rightWidth }]} />
              </View>
              <Text style={styles.quickGraphBarValue}>{rightValue.toLocaleString('fr-FR')}</Text>
            </View>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.versusResultContainer}>
        <View style={styles.versusContainer}>
          {/* Headers */}
          <View style={styles.versusHeaderRow}>
            <View style={styles.versusPlayerHeader}>
              <Text style={styles.versusPlayerName}>{versusPlayer1.name}</Text>
              <Text style={styles.versusPlayerTag}>{versusPlayer1.tag}</Text>
            </View>
            <Text style={styles.versusVsText}>VS</Text>
            <View style={styles.versusPlayerHeader}>
              <Text style={styles.versusPlayerName}>{versusPlayer2.name}</Text>
              <Text style={styles.versusPlayerTag}>{versusPlayer2.tag}</Text>
            </View>
          </View>

          {/* Comparaison des statistiques */}
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Comparaison</Text>
            <ComparisonStat label="Trophées" stat1={stats1.trophies} stat2={stats2.trophies} />
            <ComparisonStat label="Max Trophées" stat1={stats1.maxTrophies} stat2={stats2.maxTrophies} />
            <ComparisonStat label="Niveau" stat1={stats1.level} stat2={stats2.level} />
            <ComparisonStat label="Brawlers" stat1={stats1.brawlers} stat2={stats2.brawlers} />
            <ComparisonStat label="Prestige Total" stat1={stats1.prestigeTotal} stat2={stats2.prestigeTotal} />
            <ComparisonStat label="Victoires 3v3" stat1={stats1.victories3v3} stat2={stats2.victories3v3} />
            <ComparisonStat label="Victoires Solo" stat1={stats1.victorieSolo} stat2={stats2.victorieSolo} />
            <ComparisonStat label="Victoires Duo" stat1={stats1.victorieDuo} stat2={stats2.victorieDuo} />
          </View>

          {/* Brawlers comparaison */}
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionTitle}>Top Brawlers</Text>
            <View style={styles.brawlerComparisonRow}>
              <View style={styles.brawlerComparisonColumn}>
                <Text style={styles.brawlerComparisonPlayerName}>{versusPlayer1.name}</Text>
                {versusPlayer1.brawlers?.slice(0, 5).map((brawler, idx) => (
                  <View key={idx} style={styles.comparisonBrawlerItem}>
                    <Text style={styles.comparisonBrawlerName}>{brawler.name}</Text>
                    <Text style={styles.comparisonBrawlerStats}>{brawler.trophies} tr. • Lvl {brawler.power}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.brawlerComparisonColumn}>
                <Text style={styles.brawlerComparisonPlayerName}>{versusPlayer2.name}</Text>
                {versusPlayer2.brawlers?.slice(0, 5).map((brawler, idx) => (
                  <View key={idx} style={styles.comparisonBrawlerItem}>
                    <Text style={styles.comparisonBrawlerName}>{brawler.name}</Text>
                    <Text style={styles.comparisonBrawlerStats}>{brawler.trophies} tr. • Lvl {brawler.power}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.quickGraphSection}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="chart-bar" size={18} color="#A78BFA" />
              <Text style={styles.sectionTitle}>Graphique rapide</Text>
            </View>

            <View style={styles.quickGraphCard}>
              <MiniGraphRow label="Trophées" leftValue={stats1.trophies} rightValue={stats2.trophies} />
              <MiniGraphRow label="Niveau" leftValue={stats1.level} rightValue={stats2.level} />
              <MiniGraphRow label="Prestige" leftValue={stats1.prestigeTotal} rightValue={stats2.prestigeTotal} />
              <MiniGraphRow label="3v3" leftValue={stats1.victories3v3} rightValue={stats2.victories3v3} />
            </View>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Brawl Stars</Text>
        <View style={styles.userBar}>
          <View style={styles.userIdentityCard}>
            <View style={styles.userIconWrap}>
              <MaterialCommunityIcons name="account-circle" size={24} color="#FF6B35" />
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

      {/* Onglets */}
      <View style={styles.tabsContainer}>
        <Button
          title="Brawlers"
          onPress={() => setActiveTab('brawlers')}
          color={activeTab === 'brawlers' ? '#FF6B35' : '#666'}
        />
        <Button
          title="Joueur"
          onPress={() => setActiveTab('player')}
          color={activeTab === 'player' ? '#FF6B35' : '#666'}
        />
        <Button
          title="Versus"
          onPress={() => setActiveTab('versus')}
          color={activeTab === 'versus' ? '#FF6B35' : '#666'}
        />
        <Button
          title="Profil"
          onPress={() => setActiveTab('profile')}
          color={activeTab === 'profile' ? '#FF6B35' : '#666'}
        />
      </View>

      {/* Contenu Brawlers */}
      {activeTab === 'brawlers' && (
        <View style={styles.tabContent}>
          <View style={styles.buttonContainer}>
            <Button
              title={loading && activeTab === 'brawlers' ? "Chargement..." : "Charger les Brawlers"}
              onPress={fetchBrawlers}
              disabled={loading}
              color="#FF6B35"
            />
          </View>

          {loading && activeTab === 'brawlers' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Chargement des brawlers...</Text>
            </View>
          )}

          {brawlers.length > 0 && !loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{brawlers.length} Brawlers</Text>
            </View>
          )}

          {brawlers.length > 0 && !loading && (
            <FlatList
              data={brawlers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderBrawlerCard}
              scrollEnabled={true}
              style={styles.listContainer}
              contentContainerStyle={styles.listContent}
            />
          )}

          {brawlers.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Appuyez sur le bouton pour charger les brawlers</Text>
            </View>
          )}
        </View>
      )}

      {/* Contenu Joueur */}
      {activeTab === 'player' && (
        <View style={styles.tabContent}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Entrez le hashtag (#2PP...)"
              placeholderTextColor="#888"
              value={playerTag}
              onChangeText={setPlayerTag}
            />
            <Button
              title="Chercher"
              onPress={fetchPlayer}
              disabled={loading}
              color="#FF6B35"
            />
          </View>

          {loading && activeTab === 'player' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Recherche du joueur...</Text>
            </View>
          )}

          {playerData && !loading && renderPlayerCard()}

          {!playerData && !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Entrez un hashtag et recherchez un joueur</Text>
            </View>
          )}
        </View>
      )}

      {/* Contenu Versus */}
      {activeTab === 'versus' && (
        <ScrollView
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.versusInputContainer}>
            <View style={styles.versusAutoPlayerCard}>
              <Text style={styles.versusInputLabel}>Joueur 1 connecté</Text>
              <Text style={styles.versusAutoPlayerName}>
                {currentUser.prenom} {currentUser.nom}
              </Text>
              <Text style={styles.versusAutoPlayerTag}>{currentUser.player_tag}</Text>
            </View>

            <View style={styles.versusInputGroup}>
              <Text style={styles.versusInputLabel}>Joueur à comparer</Text>
              <TextInput
                style={styles.input}
                placeholder="Hashtag du joueur à comparer"
                placeholderTextColor="#888"
                value={versusOpponentTag}
                onChangeText={setVersusOpponentTag}
              />
            </View>

            <Button
              title={loading ? "Chargement..." : "Comparer"}
              onPress={fetchVersus}
              disabled={loading}
              color="#FF6B35"
            />
          </View>

          {loading && activeTab === 'versus' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Chargement de la comparaison...</Text>
            </View>
          )}

          {versusPlayer1 && versusPlayer2 && !loading && renderVersusComparison()}

          {!versusPlayer1 && !versusPlayer2 && !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Entrez le hashtag du joueur à comparer puis appuyez sur Comparer</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Contenu Profil */}
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