import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = 80;
const SNAP_THRESHOLD = 50; // Distance in pixels to snap to a slot

interface EventCardProps {
  title: string;
  date: string;
  imageUrl: string;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDrop?: (slotIndex: number) => void;
  slotPositions?: { x: number; y: number }[];
}

export const EventCard: React.FC<EventCardProps> = ({ 
  title, 
  date, 
  imageUrl,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDrop,
  slotPositions = []
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isOverSlot = useSharedValue(false);

  const findNearestSlot = (x: number, y: number) => {
    let nearestIndex = -1;
    let minDistance = Infinity;

    slotPositions.forEach((slot, index) => {
      const distance = Math.sqrt(
        Math.pow(x - slot.x, 2) + Math.pow(y - slot.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    return { index: nearestIndex, distance: minDistance };
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: withSpring(isDragging ? 1.05 : 1) }
      ],
      opacity: withTiming(isDragging ? 0.8 : 1),
      backgroundColor: withTiming(isOverSlot.value ? '#E3F2FD' : '#FFFFFF'),
    };
  });

  const handleGestureEvent = (event: any) => {
    'worklet';
    translateX.value = event.translationX;
    translateY.value = event.translationY;

    // Check if we're over a slot
    const { distance } = findNearestSlot(event.translationX, event.translationY);
    isOverSlot.value = distance < SNAP_THRESHOLD;
  };

  const handleGestureBegin = () => {
    'worklet';
    if (onDragStart) {
      runOnJS(onDragStart)();
    }
  };

  const handleGestureEnd = () => {
    'worklet';
    const { index, distance } = findNearestSlot(translateX.value, translateY.value);
    
    if (distance < SNAP_THRESHOLD && onDrop) {
      // Snap to slot
      translateX.value = withSpring(slotPositions[index].x);
      translateY.value = withSpring(slotPositions[index].y);
      runOnJS(onDrop)(index);
    } else {
      // Return to original position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }

    isOverSlot.value = false;
    if (onDragEnd) {
      runOnJS(onDragEnd)();
    }
  };

  return (
    <PanGestureHandler
      onBegan={handleGestureBegin}
      onEnded={handleGestureEnd}
      onGestureEvent={handleGestureEvent}
      activeOffsetX={[-10, 10]}
      activeOffsetY={[-10, 10]}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.date}>
            {date}
          </Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: CARD_HEIGHT,
    height: CARD_HEIGHT,
  },
  content: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666666',
  },
}); 