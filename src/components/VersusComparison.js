import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles';

/**
 * Renders the versus comparison result between two players.
 * @param {Object} props - Component props.
 * @param {Object|null} props.versusPlayer1 - Left player data.
 * @param {Object|null} props.versusPlayer2 - Right player data.
 * @returns {JSX.Element|null} The versus comparison UI, or null when incomplete.
 */
export const VersusComparison = ({ versusPlayer1, versusPlayer2 }) => {
  if (!versusPlayer1 || !versusPlayer2) {
    return null;
  }

  const leftStats = {
    trophies: versusPlayer1.trophies || 0,
    maxTrophies: versusPlayer1.highestTrophies || 0,
    level: versusPlayer1.expLevel || 0,
    brawlers: versusPlayer1.brawlers?.length || 0,
    prestigeTotal: versusPlayer1.totalPrestigeLevel || 0,
    victories3v3: versusPlayer1['3vs3Victories'] || 0,
    victoriesSolo: versusPlayer1.soloVictories || 0,
    victoriesDuo: versusPlayer1.duoVictories || 0,
  };

  const rightStats = {
    trophies: versusPlayer2.trophies || 0,
    maxTrophies: versusPlayer2.highestTrophies || 0,
    level: versusPlayer2.expLevel || 0,
    brawlers: versusPlayer2.brawlers?.length || 0,
    prestigeTotal: versusPlayer2.totalPrestigeLevel || 0,
    victories3v3: versusPlayer2['3vs3Victories'] || 0,
    victoriesSolo: versusPlayer2.soloVictories || 0,
    victoriesDuo: versusPlayer2.duoVictories || 0,
  };

  /**
   * Renders a single stat row with a visual winner highlight.
   * @param {Object} props - Component props.
   * @param {string} props.label - Stat label.
   * @param {number} props.leftValue - Left player stat value.
   * @param {number} props.rightValue - Right player stat value.
   * @returns {JSX.Element} The comparison stat row.
   */
  const ComparisonStat = ({ label, leftValue, rightValue }) => {
    const winner = leftValue > rightValue ? 1 : rightValue > leftValue ? 2 : 0;

    return (
      <View style={styles.comparisonStat}>
        <View style={[styles.statColumn, winner === 1 && { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.comparisonValue}>{leftValue}</Text>
        </View>
        <Text style={styles.comparisonLabel}>{label}</Text>
        <View style={[styles.statColumn, winner === 2 && { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.comparisonValue}>{rightValue}</Text>
        </View>
      </View>
    );
  };

  /**
   * Renders a compact bar comparison for the versus overview.
   * @param {Object} props - Component props.
   * @param {string} props.label - Graph label.
   * @param {number} props.leftValue - Left player value.
   * @param {number} props.rightValue - Right player value.
   * @returns {JSX.Element} The mini graph row.
   */
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

        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Comparaison</Text>
          <ComparisonStat label="Trophées" leftValue={leftStats.trophies} rightValue={rightStats.trophies} />
          <ComparisonStat label="Max Trophées" leftValue={leftStats.maxTrophies} rightValue={rightStats.maxTrophies} />
          <ComparisonStat label="Niveau" leftValue={leftStats.level} rightValue={rightStats.level} />
          <ComparisonStat label="Brawlers" leftValue={leftStats.brawlers} rightValue={rightStats.brawlers} />
          <ComparisonStat label="Prestige Total" leftValue={leftStats.prestigeTotal} rightValue={rightStats.prestigeTotal} />
          <ComparisonStat label="Victoires 3v3" leftValue={leftStats.victories3v3} rightValue={rightStats.victories3v3} />
          <ComparisonStat label="Victoires Solo" leftValue={leftStats.victoriesSolo} rightValue={rightStats.victoriesSolo} />
          <ComparisonStat label="Victoires Duo" leftValue={leftStats.victoriesDuo} rightValue={rightStats.victoriesDuo} />
        </View>

        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Top Brawlers</Text>
          <View style={styles.brawlerComparisonRow}>
            <View style={styles.brawlerComparisonColumn}>
              <Text style={styles.brawlerComparisonPlayerName}>{versusPlayer1.name}</Text>
              {versusPlayer1.brawlers?.slice(0, 5).map((brawler, index) => (
                <View key={`${versusPlayer1.tag}-${brawler.name}-${index}`} style={styles.comparisonBrawlerItem}>
                  <Text style={styles.comparisonBrawlerName}>{brawler.name}</Text>
                  <Text style={styles.comparisonBrawlerStats}>{brawler.trophies} tr. • Lvl {brawler.power}</Text>
                </View>
              ))}
            </View>

            <View style={styles.brawlerComparisonColumn}>
              <Text style={styles.brawlerComparisonPlayerName}>{versusPlayer2.name}</Text>
              {versusPlayer2.brawlers?.slice(0, 5).map((brawler, index) => (
                <View key={`${versusPlayer2.tag}-${brawler.name}-${index}`} style={styles.comparisonBrawlerItem}>
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
            <MiniGraphRow label="Trophées" leftValue={leftStats.trophies} rightValue={rightStats.trophies} />
            <MiniGraphRow label="Niveau" leftValue={leftStats.level} rightValue={rightStats.level} />
            <MiniGraphRow label="Prestige" leftValue={leftStats.prestigeTotal} rightValue={rightStats.prestigeTotal} />
            <MiniGraphRow label="3v3" leftValue={leftStats.victories3v3} rightValue={rightStats.victories3v3} />
          </View>
        </View>
      </View>
    </View>
  );
};
