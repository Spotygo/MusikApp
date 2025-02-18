import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from '@react-native-community/slider';

export default function PlaylistScreen() {
  const [playlist, setPlaylist] = useState([]);
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadPlaylist();
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  async function loadPlaylist() {
    const stored = await AsyncStorage.getItem("offlineSongs");
    setPlaylist(stored ? JSON.parse(stored) : []);
  }

  async function togglePlay(song) {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound, status } = await Audio.Sound.createAsync(
      { uri: song.localUri },
      { shouldPlay: true, volume },
      onPlaybackStatusUpdate
    );

    setSound(newSound);
    setPlaying(song.trackId);
    setIsPlaying(true);
    setDuration(status.durationMillis / 1000);
  }

  function onPlaybackStatusUpdate(status) {
    if (status.isPlaying) {
      setCurrentTime(status.positionMillis / 1000);
    }
  }

  async function pauseResume() {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  }

  async function skipForward() {
    if (sound) {
      await sound.setPositionAsync(currentTime + 10 < duration ? currentTime + 10 : duration - 1);
    }
  }

  async function skipBackward() {
    if (sound) {
      await sound.setPositionAsync(currentTime - 10 > 0 ? currentTime - 10 : 0);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Meine Playlist</Text>
      <FlatList
        data={playlist}
        keyExtractor={(item) => item.trackId}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => togglePlay(item)} style={styles.songCard}>
            <Text style={[styles.songText, playing === item.trackId && styles.playingText]}>
              {item.trackName} - {item.artistName}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Steuerung der Audio-Wiedergabe */}
      {isPlaying && (
        <View style={styles.controls}>
          <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
            <Text style={styles.controlText}>⏪</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={pauseResume} style={styles.controlButton}>
            <Text style={styles.controlText}>{isPlaying ? "⏸️" : "▶️"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
            <Text style={styles.controlText}>⏩</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lautstärkeregler */}
      <View style={styles.volumeControl}>
        <Text style={styles.volumeText}>Lautstärke</Text>
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolume}
        />
      </View>

      {/* Aktuelle Wiedergabeposition */}
      {isPlaying && (
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>{Math.floor(currentTime)}s / {Math.floor(duration)}s</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20, paddingTop: 60 },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "white", 
    textAlign: "center", 
    marginBottom: 40,
    marginTop: 40,
  },
  songCard: { 
    padding: 15, 
    backgroundColor: "#1e1e1e", 
    marginBottom: 15,
    borderRadius: 10,
  },
  songText: { color: "white", fontSize: 16 },
  playingText: { color: "#1DB954", fontWeight: "bold" },

  // Steuerungsbereich
  controls: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 20,
  },
  controlButton: {
    padding: 15,
    backgroundColor: "#1DB954",
    borderRadius: 50,
    margin: 10,
  },
  controlText: { fontSize: 30, color: "white" },

  // Lautstärkeregler
  volumeControl: {
    alignItems: "center",
    marginTop: 30,
  },
  volumeText: {
    color: "white",
    fontSize: 16,
  },
  volumeSlider: {
    width: 200,
    height: 40,
  },

  // Fortschrittsanzeige
  progressBar: {
    alignItems: "center",
    marginTop: 10,
  },
  progressText: {
    color: "white",
    fontSize: 14,
  },
});
