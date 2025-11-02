import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://i.pravatar.cc/200' }} style={styles.avatar} />
      <Text style={styles.name}>John Doe</Text>
      <Text style={styles.email}>johndoe@email.com</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Streak</Text>
        <Text style={styles.cardValue}>7 Days 🔥</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Habits Completed</Text>
        <Text style={styles.cardValue}>22 ✅</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 60, backgroundColor: '#fff' },
  avatar: { width: 110, height: 110, borderRadius: 60, marginBottom: 15 },
  name: { fontSize: 22, fontWeight: '600' },
  email: { fontSize: 16, color: '#6b7280', marginBottom: 30 },
  card: { width: '85%', padding: 20, backgroundColor: '#f3f4f6', borderRadius: 12, marginVertical: 10, alignItems: 'center' },
  cardTitle: { fontSize: 16, color: '#6b7280' },
  cardValue: { fontSize: 20, fontWeight: '600', marginTop: 5 },
});
