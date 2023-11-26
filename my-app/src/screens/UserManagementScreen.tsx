import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../App"; // Assure-toi que le chemin est correct
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSocket, encodeAsync, decodeAsync } from "../utils/socket";
type Props = StackScreenProps<RootStackParamList, "UserManagement">;
import { 
  IPacket,
  IStatusChannelPacket,
  IListChannelPacket,
  IJoinChannelPacket,
  StatusChannelType,
  ChannelType,
  IStatusClientPacket,
  IClientListPacket
} from "../packet/index";

type User = {
  name: string;
};

const UserManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);    
  const [currentUser, setCurrentUser] = useState(''); // Nom d'utilisateur actuel


    const fetchUserName = async () => {
      try {
        const userName = await AsyncStorage.getItem('pseudo');
        if (userName !== null) {
          setCurrentUser(userName);
        }
      } catch (e) {
        // traitement de l'erreur
        console.error(e);
      }
    };

    useEffect(() => {
      const socket = getSocket();
      const fetchGroups = async () => {
        socket.emit("packet", await encodeAsync({ networkId: "get_list_client_packet"}));
      };
      const handleCustomEvent = async (buffer: Uint8Array) => {
        const packet: IPacket = await decodeAsync(buffer);
        if (packet.networkId === "status_client_packet") {
          const statusPacket: IStatusClientPacket = packet as IStatusClientPacket;
          if(statusPacket.status === "add"){
            setUsers((users) => [...users, { id: String(users.length + 1), name: statusPacket.client }]);
          }else if(statusPacket.status === "remove") {
            setUsers((users) =>  [...users.filter((user) => user.name !== statusPacket.client)] );
          }
        }else if(packet.networkId === "client_list_packet") {
          const listPacket = packet as IClientListPacket;
          let id = 0;
          setUsers((users) => listPacket.clients.map((client) => ({ id: String(id++), name: client })));
        }
      };
      socket.on("packet", handleCustomEvent);
      fetchGroups();
      return () => {
        console.log('Component will unmount, cleaning up...');
        // Désabonner l'événement pour éviter les fuites de mémoire
        socket.off('packet', handleCustomEvent);
      };
    }, []);

  const handleSelectUser = async (userName: string) => {
    navigation.navigate("Chat", { user: userName});
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectUser(item.name)}>
            <Text style={styles.groupItem}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {/* Boutons pour retourner à la sélection de groupe ou aller au chat général */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  groupCreationContainer: {
    flexDirection: "row",
    padding: 10,
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
  },
  groupItem: {
    padding: 10,
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "rgba(255, 255, 255, 0.3)", // Fond semi-transparent pour l'input
    color: "black", // Couleur du texte
    width: "80%",
    padding: 10,
    marginBottom: 20,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
});

export default UserManagementScreen;