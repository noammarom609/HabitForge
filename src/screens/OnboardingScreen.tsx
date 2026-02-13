import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from 'react-native';
import { markOnboardingDone } from '../data/storage';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const slides = [
  {
    emoji: '📋',
    title: 'Track Your Habits',
    subtitle:
      'Create custom habits and track them daily.\nSet reminders so you never miss a day.',
  },
  {
    emoji: '🔥',
    title: 'Build Streaks',
    subtitle:
      'Stay consistent and build streaks.\nSee how many days in a row you can keep going.',
  },
  {
    emoji: '📊',
    title: 'See Your Progress',
    subtitle:
      'View weekly and monthly statistics.\nUnderstand your patterns and improve.',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onDone = async () => {
    await markOnboardingDone();
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  const onNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onDone();
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>

        {currentIndex < slides.length - 1 && (
          <Pressable onPress={onDone} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6366F1',
  },
  skipBtn: {
    marginTop: 16,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
});
