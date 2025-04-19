import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function DriverDashboard() {
  const screenHeight = Dimensions.get('window').height;

  // State for driving time (in seconds), total trip time (in seconds), and break-in time
  const [drivingTime, setDrivingTime] = useState(0);
  const [totalTripTime, setTotalTripTime] = useState(0);
  const [breakInTime, setBreakInTime] = useState(2); // 2 hours countdown (in seconds)
  const [isDriving, setIsDriving] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // To track if driving is paused
  const [showResumeButton, setShowResumeButton] = useState(false); // To show "Resume Drive" button
  const [isStarted, setIsStarted] = useState(false); // To track if Begin Drive is pressed
  const [showStopImage, setShowStopImage] = useState(false); // To track if the stop image is shown

  // Timer interval references
  const drivingInterval = useRef<NodeJS.Timeout | null>(null);
  const tripInterval = useRef<NodeJS.Timeout | null>(null);
  const breakInInterval = useRef<NodeJS.Timeout | null>(null);

  // Animated value for "STOP.png" image scale (for heartbeat animation)
  const scaleValue = useRef(new Animated.Value(1)).current;

  // State for the siren sound
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Function to start both the driving time and total trip time
  const startDrive = () => {
    setIsStarted(true);
    setIsDriving(true);
    setShowResumeButton(false); // Hide Resume button initially

    // Start driving time timer
    drivingInterval.current = setInterval(() => {
      setDrivingTime((prevTime) => prevTime + 1);
    }, 1000);

    // Start total trip time timer
    tripInterval.current = setInterval(() => {
      setTotalTripTime((prevTime) => prevTime + 1);
    }, 1000);

    // Start "Break in" countdown timer
    breakInInterval.current = setInterval(() => {
      setBreakInTime((prevTime) => {
        if (prevTime > 0) return prevTime - 1;
        clearInterval(breakInInterval.current!); // Stop countdown when it reaches 0
        return 0;
      });
    }, 1000);
  };

  // Function to stop the timer (if needed)
  const stopDrive = () => {
    clearInterval(drivingInterval.current!);
    clearInterval(tripInterval.current!);
    clearInterval(breakInInterval.current!);
    setIsDriving(false);
  };

  // Function to pause both timers and reset driving time
  const takeABreak = () => {
    clearInterval(drivingInterval.current!); // Pause driving timer
    clearInterval(tripInterval.current!); // Pause trip timer
    clearInterval(breakInInterval.current!); // Pause break-in timer
    setIsPaused(true); // Mark as paused
    setShowResumeButton(true); // Show "Resume Drive" button
    setDrivingTime(0); // Reset driving time
    setBreakInTime(2); // Reset break-in timer to 2 hours
    setShowStopImage(false); // Hide the STOP image when taking a break
    if (sound) {
      sound.stopAsync(); // Stop the siren if it's playing
    }
  };

  // Function to resume both timers and start break-in countdown
  const resumeDrive = () => {
    setIsPaused(false); // Mark as not paused
    setShowResumeButton(false); // Hide "Resume Drive" button

    // Restart both timers
    drivingInterval.current = setInterval(() => {
      setDrivingTime((prevTime) => prevTime + 1);
    }, 1000);

    tripInterval.current = setInterval(() => {
      setTotalTripTime((prevTime) => prevTime + 1);
    }, 1000);

    // Restart break-in countdown from 2 hours (7200 seconds)
    breakInInterval.current = setInterval(() => {
      setBreakInTime((prevTime) => {
        if (prevTime > 0) return prevTime - 1;
        clearInterval(breakInInterval.current!); // Stop countdown when it reaches 0
        return 0;
      });
    }, 1000);
  };

  // Convert seconds to hh:mm:ss format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Function to trigger the heartbeat effect and play the siren sound when breakInTime reaches 0
  const triggerHeartbeatEffect = async () => {
    if (breakInTime === 0) {
      // Show the STOP image when break-in time reaches 0
      setShowStopImage(true);

      // Play the siren sound only if it's not already playing
      // if (!sound) {
        const { sound: sirenSound } = await Audio.Sound.createAsync(
          require('@/assets/siren.wav') // Your siren sound file location
        );
        setSound(sirenSound);
        await sirenSound.playAsync();
      // }

      // Animate the scale of the STOP image (heartbeat effect)
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 2, // Make the image 2x its original size
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1, // Return to original size
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  // Trigger the heartbeat effect when break-in timer reaches zero
  useEffect(() => {
    triggerHeartbeatEffect();
  }, [breakInTime]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Icons */}
      <View style={styles.headerIcons}>
        <Ionicons name="menu" size={35} color="#fff" />
        <View style={styles.profileCircle} />
      </View>

      {/* App Title with Zzz image */}
      <View style={styles.titleRow}>
        <Text style={styles.greeting}>Drow</Text>
        <Image source={require('@/assets/images/Zzz.png')} style={styles.zzz} />
        <Text style={styles.greeting}>i</Text>
      </View>

      {/* Stats Box */}
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Driving time: <Text style={styles.bold}>{formatTime(drivingTime)}</Text>
        </Text>
        <Text style={styles.cardText}>
          Break in: <Text style={styles.bold}>{formatTime(breakInTime)}</Text>
        </Text>
        <Text style={styles.cardText}>
          Total Trip: <Text style={styles.bold}>{formatTime(totalTripTime)}</Text>
        </Text>
      </View>

      {/* Stop in Box */}
      <View style={styles.card}>
        <Text style={styles.cardText}>
          Stop in: <Text style={styles.bold}>xxx</Text> mi
        </Text>
      </View>

      {/* Heartbeat Animation for STOP image */}
      {showStopImage && (
        <Animated.Image
          source={require('@/assets/images/STOP.png')}
          style={[styles.stopImage, { transform: [{ scale: scaleValue }] }]}
        />
      )}

      {/* Spacer to avoid overlapping with button */}
      <View style={{ height: 80 }} />

      {/* Begin Drive Button - Centered below the Spotify Section */}
      {!isDriving && !isPaused && (
        <TouchableOpacity style={styles.beginDriveButton} onPress={startDrive}>
          <Text style={styles.beginDriveButtonText}>Begin Drive</Text>
        </TouchableOpacity>
      )}

      {/* Take A Break Button */}
      {isDriving && !isPaused && (
        <TouchableOpacity style={styles.takeABreakButton} onPress={takeABreak}>
          <Text style={styles.breakButtonText}>Take A Break</Text>
        </TouchableOpacity>
      )}

      {/* Resume Drive Button */}
      {showResumeButton && (
        <TouchableOpacity style={styles.resumeButton} onPress={resumeDrive}>
          <Text style={styles.resumeButtonText}>Resume Drive</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#121212',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#bbb',
  },
  titleRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  zzz: {
    width: 38,
    height: 38,
    marginHorizontal: 4,
    resizeMode: 'contain',
  },
  bold: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 18,
  },
  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#1e1e1e',
    gap: 10,
  },
  cardText: {
    color: '#f2f2f2',
    fontSize: 18,
  },
  stopImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: 20,
  },
  beginDriveButton: {
    marginTop: 20,
    backgroundColor: '#444',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    zIndex: 100,
    alignSelf: 'center',
  },
  beginDriveButtonText: {
    color: '#3b82f6',
    fontSize: 20,
    fontWeight: 'bold',
  },
  takeABreakButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    zIndex: 100,
  },
  breakButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumeButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    zIndex: 100,
  },
  resumeButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
