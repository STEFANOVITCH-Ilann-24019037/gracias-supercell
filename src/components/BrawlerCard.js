import { Image, Text, View } from 'react-native';
import { styles } from '../../styles';
import { getBrawlerImage } from '../services/brawlerImages';

/**
 * Renders a single brawler card with image, counters, and abilities.
 * @param {Object} props - Component props.
 * @param {Object} props.item - Brawler data to render.
 * @returns {JSX.Element} The brawler card UI.
 */
export const BrawlerCard = ({ item }) => {
  const imagePath = getBrawlerImage(item.name);

  return (
    <View style={styles.card}>
      {imagePath ? (
        <View style={styles.cardImageContainer}>
          <Image source={imagePath} style={styles.brawlerImage} resizeMode="contain" />
        </View>
      ) : null}

      <View style={styles.cardHeader}>
        <Text style={styles.brawlerName}>{item.name}</Text>
        <Text style={styles.brawlerId}>#{item.id}</Text>
      </View>

      <View style={styles.statsContainer}>
        {item.starPowers?.length > 0 ? (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Star Powers</Text>
            <Text style={styles.statValue}>{item.starPowers.length}</Text>
          </View>
        ) : null}

        {item.gadgets?.length > 0 ? (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gadgets</Text>
            <Text style={styles.statValue}>{item.gadgets.length}</Text>
          </View>
        ) : null}

        {item.gears?.length > 0 ? (
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gears</Text>
            <Text style={styles.statValue}>{item.gears.length}</Text>
          </View>
        ) : null}
      </View>

      {item.starPowers?.length > 0 ? (
        <View style={styles.abilitiesSection}>
          <Text style={styles.sectionTitle}>Star Powers:</Text>
          {item.starPowers.map((power, index) => (
            <Text key={`${power.name}-${index}`} style={styles.abilityText}>
              • {power.name}
            </Text>
          ))}
        </View>
      ) : null}

      {item.gadgets?.length > 0 ? (
        <View style={styles.abilitiesSection}>
          <Text style={styles.sectionTitle}>Gadgets:</Text>
          {item.gadgets.map((gadget, index) => (
            <Text key={`${gadget.name}-${index}`} style={styles.abilityText}>
              • {gadget.name}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};
