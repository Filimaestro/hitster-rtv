import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const TIMELINE_WIDTH = width * 0.9; // 90% of screen width
const EVENT_HEIGHT = 80; // Match the new card height

interface TimelineProps {
  events: Array<{
    id: string;
    title: string;
    date: string;
    imageUrl: string;
  }>;
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  useEffect(() => {
    console.log('Timeline rendering with events:', events.length);
  }, [events]);

  return (
    <View style={styles.container}>
      {/* Vertical line */}
      <View style={styles.line} />
      
      {/* Event slots */}
      {events.map((event, index) => (
        <View 
          key={event.id} 
          style={[
            styles.eventSlot,
            { top: index * (EVENT_HEIGHT + 8) } // 8px spacing between events
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: TIMELINE_WIDTH,
    height: 4 * (EVENT_HEIGHT + 8), // Space for 4 events with 8px spacing
    position: 'relative',
    marginVertical: 20,
  },
  line: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  eventSlot: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: EVENT_HEIGHT,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
}); 