// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../App"; // Assure-toi que le chemin est correct
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket, initSocket } from "../utils/socket";
type Props = StackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [pseudo, setPseudo] = useState("");
  const [imageUri, setImageUri] = useState("");

  const handleLogin = async () => {
    if (pseudo !== "") {
      await AsyncStorage.setItem("pseudo", pseudo);
      initSocket(pseudo, navigation);
      getSocket().on("connect_error", (err) => {
        Alert.alert(err.message);
      });
      getSocket().once("connect", () => {
        return navigation.navigate("Chat", { groupName: "global" });
      });
    } else {
      Alert.alert("Veuillez entrer un pseudo");
    }
  };

  const handleRegister = async () => {
    if (pseudo !== "") {
      await AsyncStorage.setItem("pseudo", pseudo);
      navigation.navigate("GroupManagement");
    } else {
      Alert.alert("Veuillez entrer un pseudo");
    }
  };

  useEffect(() => {
    setImageUri(
      "https://images.pexels.com/photos/18799961/pexels-photo-18799961/free-photo-of-maisons-maison-centrale-fenetres.jpeg",
    ); // URL de ton image
  }, []);

  return (
    <ImageBackground source={{ uri: imageUri }} style={styles.background}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre pseudo"
          placeholderTextColor="white" // Ajoute une couleur pour le placeholder
          value={pseudo}
          onChangeText={setPseudo}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // ou 'stretch'
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent
  },
  input: {
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Fond semi-transparent pour l'input
    color: "white", // Couleur du texte
    width: "80%",
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },

  button: {
    width: "100%",
    padding: 10,
    backgroundColor: "#007bff",
  },

  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default HomeScreen;
