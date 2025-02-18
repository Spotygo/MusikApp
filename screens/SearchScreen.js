import React, { useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function searchMusic() {
    const songs = [
      { trackId: "1", trackName: "Song A", artistName: "Artist A", localUri: "https://sample-videos.com/audio/mp3/crowd-cheering.mp3" },
      { trackId: "2", trackName: "Song B", artistName: "Artist B", localUri: "https://sample-videos.com/audio/mp3/wave.mp3" },
    ];
    setResults(songs);
  }

  async function addToPlaylist(song) {
    const stored = await AsyncStorage.getItem("offlineSongs");
    const playlist = stored ? JSON.parse(stored) : [];
    playlist.push(song);
    await AsyncStorage.setItem("offlineSongs", JSON.stringify(playlist));
    alert(`${song.trackName} hinzugefügt!`);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="🔍 Song suchen..."
        placeholderTextColor="#BBB"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchMusic}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.trackId}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.songCard} onPress={() => addToPlaylist(item)}>
            <Text style={styles.songText}>{item.trackName} - {item.artistName}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20, paddingTop: 60 },
  searchBar: { 
    backgroundColor: "#222", 
    padding: 15, 
    borderRadius: 10, 
    color: "white", 
    marginBottom: 20,
    marginTop: 40,
  },
  songCard: { 
    padding: 15, 
    backgroundColor: "#1e1e1e", 
    marginBottom: 15,
    borderRadius: 10,
  },
  songText: { color: "white", fontSize: 16 },
});
