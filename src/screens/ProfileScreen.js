import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';

/**
 * Screen that displays the connected user's profile, statistics, QR code, and sharing actions.
 * @param {Object} props - Component props.
 * @param {Object} props.currentUser - Connected user data.
 * @param {Function} props.onOpenQrScanner - Callback invoked to open the QR scanner.
 * @returns {JSX.Element} The profile screen UI.
 */
export const ProfileScreen = ({ currentUser, onOpenQrScanner }) => {
  const [saving, setSaving] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const playerStats = currentUser.playerStats || {};
  const statsCardRef = useRef(null);

  const chartData = [
    {
      label: 'Trophées',
      value: playerStats.trophies || 0,
      max: 160000,
    },
    {
      label: 'Niveau',
      value: playerStats.expLevel || 0,
      max: 500,
    },
    {
      label: 'Prestige',
      value: playerStats.totalPrestigeLevel || 0,
      max: 120,
    },
    {
      label: '3v3',
      value: playerStats['3vs3Victories'] || 0,
      max: 120000,
    },
    {
      label: 'Solo',
      value: playerStats.soloVictories || 0,
      max: 2000,
    },
    {
      label: 'Duo',
      value: playerStats.duoVictories || 0,
      max: 5000,
    },
  ];

  /**
   * Displays a short flash message after a share action.
   * @param {string} message - Message to display.
   * @returns {void}
   */
  const showFlashMessage = (message) => {
    setFlashMessage(message);
    setTimeout(() => {
      setFlashMessage('');
    }, 1500);
  };

  /**
   * Renders the radar chart used to visualize player statistics.
   * @param {Object} props - Component props.
   * @param {Array<Object>} props.data - Radar chart points.
   * @returns {JSX.Element} The radar chart UI.
   */
  const RadarChart = ({ data }) => {
    const size = 220;
    const center = size / 2;
    const radius = 76;
    const total = data.length;

    const pointFor = (index, value) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
      const ratio = Math.max(0.12, Math.min(1, value / data[index].max));
      const scaledRadius = radius * ratio;
      const x = center + scaledRadius * Math.cos(angle);
      const y = center + scaledRadius * Math.sin(angle);
      return `${x},${y}`;
    };

    const ringPoints = (ratio) =>
      data
        .map((_, index) => {
          const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
          const r = radius * ratio;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return `${x},${y}`;
        })
        .join(' ');

    const filledPoints = data.map((item, index) => pointFor(index, item.value)).join(' ');

    const labelPositions = data.map((item, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
      const labelRadius = radius + 24;
      return {
        label: item.label,
        x: center + labelRadius * Math.cos(angle),
        y: center + labelRadius * Math.sin(angle),
        angle,
      };
    });

    return (
      <View style={styles.radarWrapper}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={10} fill="#00ff00" fillOpacity="0.9" />
          {[0.33, 0.66, 1].map((ratio, index) => (
            <Polygon
              key={`ring-${index}`}
              points={ringPoints(ratio)}
              fill="none"
              stroke={index === 2 ? '#00ff00' : '#334155'}
              strokeWidth={index === 2 ? 1.5 : 1}
              strokeDasharray={index === 2 ? '0' : '4 4'}
            />
          ))}

          {data.map((_, index) => {
            const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <Line
                key={`axis-${index}`}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#475569"
                strokeWidth={1}
              />
            );
          })}

          <Polygon
            points={filledPoints}
            fill="rgba(0, 255, 0, 0.28)"
            stroke="#00ff00"
            strokeWidth={2}
          />

          {data.map((item, index) => {
            const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
            const markerRadius = radius * Math.max(0.12, Math.min(1, item.value / item.max));
            const x = center + markerRadius * Math.cos(angle);
            const y = center + markerRadius * Math.sin(angle);
            return <Circle key={`marker-${index}`} cx={x} cy={y} r={3.5} fill="#FFFFFF" />;
          })}

          {labelPositions.map((pos, index) => (
            <SvgText
              key={`label-${index}`}
              x={pos.x}
              y={pos.y}
              fill="#CBD5E1"
              fontSize="10"
              fontWeight="600"
              textAnchor={pos.angle > -Math.PI / 2 && pos.angle < Math.PI / 2 ? 'start' : pos.angle === -Math.PI / 2 ? 'middle' : 'end'}
            >
              {pos.label}
            </SvgText>
          ))}
        </Svg>
      </View>
    );
  };

  /**
   * Captures the stats card as a PNG image and shares it through the OS share sheet.
   * @returns {Promise<void>} A promise that resolves when the export flow completes.
   */
  const downloadStatsAsPng = async () => {
    try {
      setSaving(true);

      if (!statsCardRef.current) {
        Alert.alert('Erreur', 'Impossible de capturer l\'écran');
        return;
      }

      const uri = await captureRef(statsCardRef, {
        format: 'png',
        quality: 0.95,
        width: 540,
        height: 960,
      });

      const timestamp = new Date().getTime();
      const fileName = `Stats_${currentUser.id}_${timestamp}.png`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: filePath,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'image/png',
          dialogTitle: 'Partager mon profil Brawl Stars',
          UTI: 'public.png',
        });
        showFlashMessage('Image PNG creee');
      } else {
        showFlashMessage('PNG cree, partage indisponible');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert(
        'Erreur',
        `Impossible de créer l'image.\n\n${error.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
      <ScrollView style={styles.container}>
          <View style={styles.header}>
              <Text style={styles.pageTitle}>Mon Profil</Text>
          </View>

      <View ref={statsCardRef} style={styles.profileCard} collapsable={false}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={100} color="#00ff00" />
        </View>

        <View style={styles.userSection}>
          <Text style={styles.fullName}>
            {currentUser.prenom} {currentUser.nom}
          </Text>
          <Text style={styles.subtitle}>
            {playerStats.name || 'Joueur Brawl Stars'}
          </Text>
          <View style={styles.tagBadge}>
            <MaterialCommunityIcons name="tag-outline" size={12} color="#FFD8CC" />
            <Text style={styles.tagBadgeText}>{currentUser.player_tag}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email" size={16} color="#00ff00" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{currentUser.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="hashtag" size={16} color="#00ff00" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ID Joueur</Text>
              <Text style={styles.infoValue}>{currentUser.player_tag}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="shield-account" size={16} color="#00ff00" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ID Compte</Text>
              <Text style={styles.infoValue}>#{currentUser.id}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="chart-box-outline" size={18} color="#00ff00" />
            <Text style={styles.sectionTitle}>Statistiques</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {(playerStats.trophies || 0).toLocaleString('fr-FR')}
              </Text>
              <Text style={styles.statLabel}>Trophées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{playerStats.expLevel || 0}</Text>
              <Text style={styles.statLabel}>Niveau</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {playerStats.totalPrestigeLevel || 0}
              </Text>
              <Text style={styles.statLabel}>Prestige</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {(playerStats['3vs3Victories'] || 0).toLocaleString('fr-FR')}
              </Text>
              <Text style={styles.statLabel}>3v3</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {(playerStats.soloVictories || 0).toLocaleString('fr-FR')}
              </Text>
              <Text style={styles.statLabel}>Solo</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {(playerStats.duoVictories || 0).toLocaleString('fr-FR')}
              </Text>
              <Text style={styles.statLabel}>Duo</Text>
            </View>
          </View>

          <View style={styles.radarCard}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="radar" size={18} color="#00ff00" />
              <Text style={styles.sectionTitle}>Profil radar</Text>
            </View>
            <RadarChart data={chartData} />
          </View>
        </View>

        {playerStats.club && (
          <View style={styles.clubSection}>
            <View style={styles.sectionHeaderRow}>
              <MaterialCommunityIcons name="home-group" size={18} color="#00ff00" />
              <Text style={styles.sectionTitle}>Club</Text>
            </View>
            <View style={styles.clubCard}>
              <Text style={styles.clubName}>{playerStats.club.name}</Text>
              <Text style={styles.clubTag}>{playerStats.club.tag}</Text>
            </View>
          </View>
        )}

        <View style={styles.qrActionSection}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="qrcode" size={18} color="#00ff00" />
            <Text style={styles.sectionTitle}>QR Code</Text>
          </View>

          <View style={styles.qrActionRow}>
            <Pressable style={styles.qrButton} onPress={() => setShowQrModal(true)}>
              <MaterialCommunityIcons name="qrcode-scan" size={18} color="#FFFFFF" />
              <Text style={styles.qrButtonText}>Afficher mon QR</Text>
            </Pressable>

            <Pressable style={styles.qrButtonSecondary} onPress={() => onOpenQrScanner?.()}>
              <MaterialCommunityIcons name="camera-outline" size={18} color="#FFFFFF" />
              <Text style={styles.qrButtonText}>Scanner un QR</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable
        onPress={downloadStatsAsPng}
        disabled={saving}
        style={({ pressed }) => [
          styles.downloadButton,
          pressed && styles.downloadButtonPressed,
          saving && styles.downloadButtonDisabled,
        ]}
      >
        {saving ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.downloadButtonText}>Création PNG...</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="share-variant" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Partager en PNG</Text>
          </>
        )}
      </Pressable>

      {flashMessage ? (
        <View style={styles.flashToast}>
          <MaterialCommunityIcons name="check-circle-outline" size={18} color="#A7F3D0" />
          <Text style={styles.flashMessage}>{flashMessage}</Text>
        </View>
      ) : null}

      <Text style={styles.hint}>
        Créer une image PNG à partager partout
      </Text>

      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.qrModalCard}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Mon QR Code</Text>
              <Pressable onPress={() => setShowQrModal(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#CBD5E1" />
              </Pressable>
            </View>

            <View style={styles.qrCodeContainer}>
              <QRCode value={currentUser.player_tag || ''} size={220} color="#FFFFFF" backgroundColor="#000000" />
            </View>

            <View style={styles.qrTagPill}>
              <Text style={styles.qrModalTag}>{currentUser.player_tag}</Text>
            </View>
            <Text style={styles.qrModalHint}>
              Scanne ce code pour remplir automatiquement le joueur 2 dans le mode Versus.
            </Text>
          </View>
        </View>
      </Modal>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 128, 0.2)',
    borderWidth: 2,
    borderColor: '#ff0080',
  },
  profileCard: {
    margin: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 216, 204, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagBadgeText: {
    color: '#FFD8CC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  infoSection: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#CBD5E1',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 2,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
  },
  radarCard: {
    marginTop: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  radarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrActionSection: {
    marginTop: 14,
    marginBottom: 6,
  },
  qrActionRow: {
    flexDirection: 'column',
    gap: 10,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: '#00ff00',
  },
  qrButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: '#ff0080',
  },
  qrButtonText: {
    color: '#00ff00',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0a0a0a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 18,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 14,
    padding: 12,
  },
  qrModalTag: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  qrTagPill: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  qrModalHint: {
    marginTop: 10,
    textAlign: 'center',
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  clubSection: {
    marginBottom: 16,
  },
  clubCard: {
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00ff00',
  },
  clubName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  clubTag: {
    fontSize: 11,
    color: '#94A3B8',
  },
  downloadButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: '#00ff00',
  },
  downloadButtonPressed: {
    backgroundColor: '#1a1a1a',
    borderColor: '#ff0080',
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    color: '#00ff00',
    fontSize: 15,
    fontWeight: '600',
  },
  flashMessage: {
    color: '#ECFDF5',
    fontSize: 12,
    fontWeight: '700',
  },
  flashToast: {
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  hint: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 11,
    marginBottom: 20,
  },
  spacer: {
    height: 20,
  },
});




