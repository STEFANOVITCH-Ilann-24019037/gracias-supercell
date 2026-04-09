import { ActivityIndicator, Button, Text, TextInput, View } from 'react-native';
import { styles } from '../../styles';
import { PlayerCard } from '../components/PlayerCard';

/**
 * Screen that lets the user search a player by hashtag and renders the result.
 * @param {Object} props - Component props.
 * @param {string} props.playerTag - Current hashtag input value.
 * @param {Function} props.onPlayerTagChange - Updates the hashtag input value.
 * @param {boolean} props.loading - Whether a search is in progress.
 * @param {Function} props.onSearchPlayer - Triggers the player lookup.
 * @param {Object|null} props.playerData - Resolved player data.
 * @returns {JSX.Element} The player search screen UI.
 */
export const PlayerSearchScreen = ({
  playerTag,
  onPlayerTagChange,
  loading,
  onSearchPlayer,
  playerData,
}) => {
  return (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Entrez le hashtag (#2PP...)"
          placeholderTextColor="#888"
          value={playerTag}
          onChangeText={onPlayerTagChange}
        />
        <Button title="Chercher" onPress={onSearchPlayer} disabled={loading} color="#00ff00" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Recherche du joueur...</Text>
        </View>
      ) : null}

      {playerData && !loading ? <PlayerCard playerData={playerData} /> : null}

      {!playerData && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Entrez un hashtag et recherchez un joueur</Text>
        </View>
      ) : null}
    </View>
  );
};
