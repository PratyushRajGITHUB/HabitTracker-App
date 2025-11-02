import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello 👋</Text>
      <Text style={styles.subtitle}>Welcome to your Habit Tracker!</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Today's Progress:</Text>
        <Text style={styles.progressCount}>0 / 5 habits done</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 30 },
  summaryBox: { backgroundColor: '#f3f4f6', padding: 20, borderRadius: 10, alignItems: 'center', width: '80%' },
  summaryText: { fontSize: 16, color: '#333' },
  progressCount: { fontSize: 20, fontWeight: 'bold', marginTop: 5, color: '#4f46e5' },
});
