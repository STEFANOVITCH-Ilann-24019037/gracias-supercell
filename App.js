import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useState } from 'react';

// URL du proxy backend local
const API_BASE = 'http://localhost:3000';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [brawlers, setBrawlers] = useState([]);
  const [playerTag, setPlayerTag] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [activeTab, setActiveTab] = useState('brawlers'); // 'brawlers' ou 'player'

  const fetchBrawlers = async () => {
    setLoading(true);
    setActiveTab('brawlers');
    const url = `${API_BASE}/api/brawlers`;
    console.log('🔗 URL:', url);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('⚠️ Erreur:', errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Brawlers reçus:', data.items?.length || 0);
      setBrawlers(data.items || []);
    } catch (error) {
      console.error('❌ Erreur:', error.message);
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
    const encodedTag = encodeURIComponent(playerTag);
    const url = `${API_BASE}/api/player/${encodedTag}`;
    console.log('🔗 URL:', url);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('⚠️ Erreur:', errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Joueur reçu:', data);
      setPlayerData(data);
    } catch (error) {
      console.error('❌ Erreur:', error.message);
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
            <View>
              <Text style={styles.playerName}>{playerData.name}</Text>
              <Text style={styles.playerTag}>{playerData.tag}</Text>
            </View>
          </View>

          <View style={styles.playerStatsGrid}>
            <View style={styles.playerStatBox}>
              <Text style={styles.playerStatLabel}>Trophées</Text>
              <Text style={styles.playerStatValue}>{playerData.trophies}</Text>
            </View>
            <View style={styles.playerStatBox}>
              <Text style={styles.playerStatLabel}>Club</Text>
              <Text style={styles.playerStatValue}>{playerData.club?.name || 'Aucun'}</Text>
            </View>
            <View style={styles.playerStatBox}>
              <Text style={styles.playerStatLabel}>Brawlers</Text>
              <Text style={styles.playerStatValue}>{playerData.brawlers?.length || 0}</Text>
            </View>
            <View style={styles.playerStatBox}>
              <Text style={styles.playerStatLabel}>Niveau</Text>
              <Text style={styles.playerStatValue}>{playerData.expLevel}</Text>
            </View>
          </View>

          {playerData.brawlers && playerData.brawlers.length > 0 && (
            <View style={styles.playerBrawlersSection}>
              <Text style={styles.sectionTitle}>Brawlers du Joueur:</Text>
              {playerData.brawlers.slice(0, 5).map((brawler, idx) => (
                <View key={idx} style={styles.playerBrawlerItem}>
                  <Text style={styles.playerBrawlerName}>{brawler.name}</Text>
                  <View style={styles.playerBrawlerStats}>
                    <Text style={styles.playerBrawlerTrophy}>⭐ {brawler.trophies}</Text>
                    <Text style={styles.playerBrawlerLevel}>Lvl {brawler.power}</Text>
                  </View>
                </View>
              ))}
              {playerData.brawlers.length > 5 && (
                <Text style={styles.moreText}>+{playerData.brawlers.length - 5} autres...</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Brawl Stars</Text>
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

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2d2d44',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
    justifyContent: 'space-around',
  },
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#2d2d44',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    fontSize: 14,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  countBadge: {
    alignSelf: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B35',
    paddingBottom: 10,
  },
  brawlerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  brawlerId: {
    fontSize: 12,
    color: '#888',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  abilitiesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  abilityText: {
    fontSize: 12,
    color: '#ddd',
    marginLeft: 5,
    marginVertical: 2,
  },
  // Styles pour la fiche joueur
  playerCardScroll: {
    flex: 1,
  },
  playerCard: {
    margin: 15,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B35',
    paddingBottom: 12,
    marginBottom: 15,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  playerTag: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  playerStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  playerStatBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playerStatLabel: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 4,
  },
  playerStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  playerBrawlersSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#FF6B35',
    paddingTop: 12,
  },
  playerBrawlerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
  },
  playerBrawlerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ddd',
  },
  playerBrawlerStats: {
    flexDirection: 'row',
    gap: 8,
  },
  playerBrawlerTrophy: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  playerBrawlerLevel: {
    fontSize: 12,
    color: '#888',
  },
  moreText: {
    fontSize: 12,
    color: '#FF6B35',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});
