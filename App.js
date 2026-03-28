import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';

// URL du proxy backend local
const API_BASE = 'http://localhost:3000';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [brawlers, setBrawlers] = useState([]);

  const fetchBrawlers = async () => {
    setLoading(true);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 Brawl Stars</Text>
        <Text style={styles.subtitle}>{brawlers.length} Brawlers</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Chargement..." : "Charger les Brawlers"}
          onPress={fetchBrawlers}
          disabled={loading}
          color="#FF6B35"
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Chargement des brawlers...</Text>
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
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
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
});
