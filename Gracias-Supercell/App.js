import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzMzc2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjA1OGZlN2U3LTk2YzUtNDVmZC1hOWRmLWMzNjhkMjViZDhlZiIsImlhdCI6MTc3NDYyNDIzNSwic3ViIjoiZGV2ZWxvcGVyL2FjMGVmMjhmLWFjYzYtMDUyMC1mY2JmLWJlNzQ4ZjdkM2MwOCIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiMTQ3Ljk0LjIyOS40MyJdLCJ0eXBlIjoiY2xpZW50In1dfQ.ugHlWeYaxH-lV-aWxEztdr6OBEYb8IbKE8r2oNuSecySaQQz3QOXy6bebX08WUOb02swQlL-EJ3vzAu0dI6lXw";
export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const makeApiRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.brawlstars.io/v1/players/%23LGQJVR2U', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Requête API</Text>

        <TextInput
          style={styles.input}
          placeholder="Entrez du texte..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor="#999"
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={makeApiRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Envoyer</Text>
          )}
        </TouchableOpacity>

        {response && (
          <View style={styles.responseBox}>
            <Text style={styles.responseTitle}>Réponse:</Text>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 100,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  responseBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  responseText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
