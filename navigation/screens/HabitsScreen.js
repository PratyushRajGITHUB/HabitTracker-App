import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/* ---------- Theme ---------- */
const ACCENT = '#ff7f6a';
const BG = '#f5f3f1';
const CARD_BG = '#f7f5f3';
const TEXT = '#1f2937';
const MUTED = '#6b7280';

/* ---------- Helpers ---------- */
const STORAGE_KEY = '@habits_v1';
const getToday = () => new Date().toISOString().split('T')[0];
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

/* ---------- Small reusable HabitItem component (has hooks inside - valid) ---------- */
const HabitItem = ({ item, onPress, renderRightActions }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8, tension: 150 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 150 }).start();
  };

  const outerShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  };
  const innerShadow = {
    shadowColor: '#000',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableWithoutFeedback onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
        <Animated.View style={[styles.card, outerShadow, item.done ? innerShadow : {}, { transform: [{ scale }] }]}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={item.done ? 'check-circle' : 'checkbox-blank-circle-outline'} size={26} color={item.done ? ACCENT : MUTED} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={[styles.streakText, item.streak > 0 ? styles.streakActive : styles.streakZero]}>
                {item.streak > 0 ? `🔥 ${item.streak}-Day Streak` : '💤 No streak yet'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Swipeable>
  );
};

/* ---------- Main Screen ---------- */
export default function HabitsScreen() {
  const [habits, setHabits] = useState([]);
  const today = getToday();
  const yesterday = getYesterday();

  /* Load from storage on mount */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setHabits(JSON.parse(raw));
          return;
        }
      } catch (e) {
        console.warn('Failed to load habits', e);
      }
      // default sample if none stored
      setHabits([
        { id: '1', title: 'Wake up early', done: false, streak: 0, lastDoneDate: null },
        { id: '2', title: 'Workout', done: false, streak: 0, lastDoneDate: null },
        { id: '3', title: 'Read 10 pages', done: false, streak: 0, lastDoneDate: null },
      ]);
    })();
  }, []);

  /* Persist on change */
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
      } catch (e) {
        console.warn('Failed to save habits', e);
      }
    })();
  }, [habits]);

  /* Add habit (iOS prompt if available) */
  const addHabit = () => {
    const promptFn = Alert.prompt;
    if (promptFn) {
      promptFn('Add a New Habit', 'Enter the habit name', (text) => {
        if (!text || !text.trim()) return;
        const newItem = { id: Date.now().toString(), title: text.trim(), done: false, streak: 0, lastDoneDate: null };
        setHabits((p) => [...p, newItem]);
      });
      return;
    }
    // fallback for Android: simple alert with instructions (you can replace with modal)
    Alert.alert('Add habit', 'This device does not support Alert.prompt. Use the app UI to add a habit.');
  };

  /* Edit habit name (simple prompt) */
  const editHabit = (id) => {
    const target = habits.find(h => h.id === id);
    if (!target) return;
    const promptFn = Alert.prompt;
    if (promptFn) {
      promptFn('Edit Habit', 'Change habit name', (text) => {
        if (!text || !text.trim()) return;
        setHabits(prev => prev.map(h => (h.id === id ? { ...h, title: text.trim() } : h)));
      }, 'plain-text', target.title);
      return;
    }
    Alert.alert('Edit habit', 'This device does not support Alert.prompt.');
  };

  /* Delete habit */
  const deleteHabit = (id) => {
    Alert.alert('Delete habit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setHabits(prev => prev.filter(h => h.id !== id)) },
    ]);
  };

  /* Toggle habit with B1+D2+S2 rules (strict once-per-day, decrease if last done 2+ days ago) */
  const toggleHabit = (id) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== id) return habit;
        const last = habit.lastDoneDate;
        if (last === today) {
          Alert.alert('Already completed', 'You already completed this habit today.');
          return habit;
        }
        let newStreak = habit.streak ?? 0;
        if (!last) newStreak = 1;
        else if (last === yesterday) newStreak = newStreak + 1;
        else newStreak = Math.max(newStreak - 1, 0);
        return { ...habit, done: true, streak: newStreak, lastDoneDate: today };
      })
    );
  };

  /* Swipe right actions rendering (Edit + Delete) - used by Swipeable */
  const renderRightActions = (id) => {
    return (
      <View style={styles.rightActions}>
        <TouchableWithoutFeedback onPress={() => editHabit(id)}>
          <View style={[styles.actionButton, styles.editButton]}>
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
            <Text style={styles.actionText}>Edit</Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => deleteHabit(id)}>
          <View style={[styles.actionButton, styles.deleteButton]}>
            <MaterialCommunityIcons name="trash-can" size={20} color="#fff" />
            <Text style={styles.actionText}>Delete</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <HabitItem item={item} onPress={() => toggleHabit(item.id)} renderRightActions={() => renderRightActions(item.id)} />
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Habits</Text>
        <Text style={styles.headerSub}>Swipe a habit to edit or delete</Text>
      </View>

      <View style={styles.addRow}>
        <TouchableWithoutFeedback onPress={addHabit}>
          <Animated.View style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>  Add Habit</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      <FlatList data={habits} renderItem={renderItem} keyExtractor={(i) => i.id} contentContainerStyle={styles.list} />
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG, paddingHorizontal: 18, paddingTop: Platform.OS === 'ios' ? 60 : 30 },

  header: { backgroundColor: '#3b82f6', borderRadius: 12, padding: 14, marginBottom: 18, shadowColor: '#06b6d4', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: '#e6f6ff', marginTop: 6, fontSize: 13 },

  addRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: ACCENT, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 30, shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  list: { paddingBottom: 40 },

  card: { borderRadius: 24, paddingVertical: 14, paddingHorizontal: 12, marginBottom: 12, backgroundColor: CARD_BG },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: CARD_BG, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  content: { flex: 1 },
  title: { color: TEXT, fontSize: 18, fontWeight: '600' },
  streakText: { marginTop: 6, fontSize: 13, fontWeight: '600' },
  streakActive: { color: ACCENT },
  streakZero: { color: MUTED },

  /* swipe actions */
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { width: 72, height: '84%', marginVertical: 8, marginLeft: 8, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  editButton: { backgroundColor: '#4f46e5' },
  deleteButton: { backgroundColor: '#ef4444' },
  actionText: { color: '#fff', marginTop: 6, fontWeight: '700' },
});
