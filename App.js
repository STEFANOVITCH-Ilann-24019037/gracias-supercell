import { StatusBar } from 'expo-status-bar';
import { Text, View, Button, ScrollView, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useState } from 'react';
import { styles } from './styles';

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
    console.log('URL:', url);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur:', errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Brawlers reçus:', data.items?.length || 0);
      setBrawlers(data.items || []);
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
    const encodedTag = encodeURIComponent(playerTag);
    const url = `${API_BASE}/api/player/${encodedTag}`;
    console.log('URL:', url);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur:', errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Joueur reçu:', data);
      setPlayerData(data);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Brawl Stars</Text>
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

