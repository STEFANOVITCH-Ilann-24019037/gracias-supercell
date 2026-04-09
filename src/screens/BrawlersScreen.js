import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native';
import { styles } from '../../styles';
import { BrawlerCard } from '../components/BrawlerCard';

/**
 * Screen that renders the brawler list and the action to load it.
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.brawlers - Brawler list to display.
 * @param {boolean} props.loading - Whether the list is currently loading.
 * @param {Function} props.onLoadBrawlers - Callback that loads brawlers.
 * @returns {JSX.Element} The brawlers screen UI.
 */
export const BrawlersScreen = ({ brawlers, loading, onLoadBrawlers }) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Chargement...' : 'Charger les Brawlers'}
          onPress={onLoadBrawlers}
          disabled={loading}
          color="#00ff00"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Chargement des brawlers...</Text>
        </View>
      ) : null}

      {brawlers.length > 0 && !loading ? (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{brawlers.length} Brawlers</Text>
        </View>
      ) : null}

      {brawlers.length > 0 && !loading ? (
        <FlatList
          data={brawlers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <BrawlerCard item={item} />}
          scrollEnabled
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
        />
      ) : null}

      {brawlers.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Appuyez sur le bouton pour charger les brawlers</Text>
        </View>
      ) : null}
    </View>
  );
};
