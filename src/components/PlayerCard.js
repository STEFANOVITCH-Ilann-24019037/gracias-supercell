import { ScrollView, Text, View } from 'react-native';
import { styles } from '../../styles';

/**
 * Renders the full player details card used in the player search screen.
 * @param {Object} props - Component props.
 * @param {Object|null} props.playerData - Player data to display.
 * @returns {JSX.Element|null} The player card UI, or null when no data is available.
 */
export const PlayerCard = ({ playerData }) => {
  if (!playerData) {
    return null;
  }

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

        {playerData.club ? (
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
        ) : null}

        {playerData.brawlers?.length > 0 ? (
          <View style={styles.playerBrawlersSection}>
            <Text style={styles.sectionTitle}>Top Brawlers</Text>
            {playerData.brawlers.slice(0, 10).map((brawler, index) => (
              <View key={`${brawler.name}-${index}`} style={styles.playerBrawlerItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.playerBrawlerName}>{brawler.name}</Text>
                  <Text style={{ fontSize: 10, color: '#888' }}>
                    Rang {brawler.rank} - Prestige {brawler.prestigeLevel}
                  </Text>
                </View>
                <View style={styles.playerBrawlerStats}>
                  <Text style={styles.playerBrawlerTrophy}>{brawler.trophies}</Text>
                  <Text style={styles.playerBrawlerLevel}>Lvl {brawler.power}</Text>
                </View>
              </View>
            ))}
            {playerData.brawlers.length > 10 ? (
              <Text
                style={{
                  fontSize: 12,
                  color: '#00ff00',
                  fontStyle: 'italic',
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                +{playerData.brawlers.length - 10} autres...
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};
