import { ActivityIndicator, Button, ScrollView, Text, TextInput, View } from 'react-native';
import { styles } from '../../styles';
import { VersusComparison } from '../components/VersusComparison';

/**
 * Screen that prepares the versus comparison form and displays the result.
 * @param {Object} props - Component props.
 * @param {Object} props.currentUser - The connected user.
 * @param {string} props.versusOpponentTag - Current opponent hashtag input value.
 * @param {Function} props.onVersusOpponentTagChange - Updates the opponent hashtag input.
 * @param {boolean} props.loading - Whether a comparison is in progress.
 * @param {Function} props.onComparePlayers - Triggers the comparison flow.
 * @param {Object|null} props.versusPlayer1 - Connected user stats payload.
 * @param {Object|null} props.versusPlayer2 - Opponent stats payload.
 * @returns {JSX.Element} The versus screen UI.
 */
export const VersusScreen = ({
  currentUser,
  versusOpponentTag,
  onVersusOpponentTagChange,
  loading,
  onComparePlayers,
  versusPlayer1,
  versusPlayer2,
}) => {
  return (
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
            onChangeText={onVersusOpponentTagChange}
          />
        </View>

        <Button title={loading ? 'Chargement...' : 'Comparer'} onPress={onComparePlayers} disabled={loading} color="#00ff00" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Chargement de la comparaison...</Text>
        </View>
      ) : null}

      {versusPlayer1 && versusPlayer2 && !loading ? <VersusComparison versusPlayer1={versusPlayer1} versusPlayer2={versusPlayer2} /> : null}

      {!versusPlayer1 && !versusPlayer2 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Entrez le hashtag du joueur à comparer puis appuyez sur Comparer</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};
