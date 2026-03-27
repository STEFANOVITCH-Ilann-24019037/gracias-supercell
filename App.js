import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import { useState } from 'react';
import BrawlStars from 'brawlstars-api-nodejs';

const token ="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjA1OGZlN2U3LTk2YzUtNDVmZC1hOWRmLWMzNjhkMjViZDhlZiIsImlhdCI6MTc3NDYyNDIzNSwic3ViIjoiZGV2ZWxvcGVyL2FjMGVmMjhmLWFjYzYtMDUyMC1mY2JmLWJlNzQ4ZjdkM2MwOCIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiMTQ3Ljk0LjIyOS40MyJdLCJ0eXBlIjoiY2xpZW50In1dfQ.ugHlWeYaxH-lV-aWxEztdr6OBEYb8IbKE8r2oNuSecySaQQz3QOXy6bebX08WUOb02swQlL-EJ3vzAu0dI6lXw";

const api = new BrawlStars.api(token);

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleButtonPress = async () => {
    setLoading(true);
    try {
      let brawler = await api.brawler(1);
      console.log(brawler);
      setResult(brawler);
    } catch (error) {
      console.error(error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title={loading ? "Chargement..." : "Appuyer ici"} onPress={handleButtonPress} disabled={loading} />

      {result && (
        <ScrollView style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {JSON.stringify(result, null, 2)}
          </Text>
        </ScrollView>
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    maxHeight: 400,
    width: '90%',
  },
  resultText: {
    fontSize: 12,
    color: '#333',
  },
});
