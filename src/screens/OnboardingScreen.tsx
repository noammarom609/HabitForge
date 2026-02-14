import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { markOnboardingDone } from '../data/storage';
import { Routes } from '../constants/routes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    icon: '📋',
    title: 'עקוב אחרי ההרגלים שלך',
    subtitle:
      'צור הרגלים מותאמים ועקוב אחריהם יומית.\nהגדר תזכורות כדי לא לפספס יום.',
  },
  {
    icon: '🔥',
    title: 'בנה רצפים',
    subtitle:
      'הישאר עקבי ובנה רצפים.\nראה כמה ימים ברצף אתה יכול להמשיך.',
  },
  {
    icon: '📊',
    title: 'ראה את ההתקדמות שלך',
    subtitle:
      'צפה בסטטיסטיקות שבועיות וחודשיות.\nהבן את הדפוסים שלך ושפר.',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const onDone = async () => {
    await markOnboardingDone();
    navigation.reset({ index: 0, routes: [{ name: Routes.Auth }] });
  };

  const onNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onDone();
    }
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (slideIndex !== currentIndex && slideIndex >= 0 && slideIndex < slides.length) {
      setCurrentIndex(slideIndex);
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Simple slide view - works better on web */}
      {Platform.OS === 'web' ? (
        <View style={styles.slideContainer}>
          <Text style={styles.icon}>{currentSlide.icon}</Text>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          contentOffset={{ x: currentIndex * SCREEN_WIDTH, y: 0 }}
        >
          {slides.map((slide, index) => (
            <View key={index} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <Text style={styles.icon}>{slide.icon}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 30) }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => setCurrentIndex(i)}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'התחל' : 'הבא'}
          </Text>
        </Pressable>

        {currentIndex < slides.length - 1 && (
          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.skipBtn,
              pressed && styles.skipPressed,
            ]}
          >
            <Text style={styles.skipText}>דלג</Text>
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
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 72,
    marginBottom: 24,
    textAlign: 'center',
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
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 28,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6366F1',
  },
  skipBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipPressed: {
    opacity: 0.7,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
});
