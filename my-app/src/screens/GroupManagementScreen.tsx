// src/screens/GroupManagementScreen.tsx

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
type Props = StackScreenProps<RootStackParamList, "GroupManagement">;
import { 
  IPacket,
  IStatusChannelPacket,
  IListChannelPacket,
  IJoinChannelPacket,
  StatusChannelType,
  ChannelType
} from "../packet/index";
// Type pour les données de groupe (ajuste selon tes besoins)
type Group = {
  id: string;
  name: string;
};

const listGroups: Group[] = [];
const GroupManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [groups, setGroups] = useState<Group[]>(listGroups);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    const socket = getSocket();
    const fetchGroups = async () => {
      socket.emit("packet", await encodeAsync({ networkId: "get_list_channel_packet", type: ["public", "whitelisted"]}));
    };
    const handleCustomEvent = async (buffer: Uint8Array) => {
      const packet: IPacket = await decodeAsync(buffer);
      if (packet.networkId === "status_channel_packet") {
        const statusPacket: IStatusChannelPacket = packet as IStatusChannelPacket;
        if(statusPacket.type == ChannelType.PUBLIC || statusPacket.type == ChannelType.WHITELISTED){
          if(statusPacket.status === "add"){
            setGroups((prev) => [...prev, { id: String(prev.length + 1), name: statusPacket.channel }]);
          }else if(statusPacket.status === "remove") {
            setGroups((prev) =>  [...prev.filter((group) => group.name !== statusPacket.channel)] );
          }
      }
      }else if(packet.networkId === "list_channel_packet") {
        const listPacket = packet as IListChannelPacket;
        let id = 0;
        setGroups((prev) => listPacket.channels.map((channel) => ({ id: String(id++), name: channel })));
      } else if(packet.networkId === "join_channel_packet") {
        const joinPacket = packet as IJoinChannelPacket;
        await AsyncStorage.setItem("currentGroup", joinPacket.channel);
        navigation.navigate("Chat", { groupName: joinPacket.channel });
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

  
  useRef(() => {
  });
  const GetAllExistingGroup = async () => {
    // Simulation d'une requête pour obtenir tous les groupes
    return groups;
  };

  const handleSelectGroup = async (groupName: string) => {
    try {
      getSocket().emit("packet", await encodeAsync({ networkId: "join_channel_packet", channel: groupName }));
    } catch (error) {
      console.error(error);
    }
  };

  const CreateNewGroup = async (groupName: string) => {
    // verifyif input is not empty
    if (groupName === "") {
      console.log("Le nom du groupe ne peut pas être vide");
      return;
    }
    const existingGroups = await GetAllExistingGroup();
    

    if (existingGroups.some((group) => group.name === groupName)) {
      // Gérer le cas où le groupe existe déjà
      console.log("Le groupe existe déjà");
      return;
    }

    // Créer un nouveau groupe (pousetItemr l'instant, juste une simulation)
    const newGroup = { id: String(existingGroups.length + 1), name: groupName };
    
    // Stocker le nouveau groupe dans AsyncStorage et naviguer
    try {
      getSocket().emit("packet", await encodeAsync({ networkId: "create_channel_packet", name: groupName, persistent: true, permission: ["*"] }));
      await AsyncStorage.setItem("currentGroup", groupName);
      navigation.navigate("Chat", { groupName });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectGroup(item.name)}>
              <Text style={styles.groupItem}>{item.name}</Text>
            </TouchableOpacity>
          )}
          
      />
      <View style={styles.groupCreationContainer}>
        <TextInput
          style={styles.input}
          placeholder="Créer un nouveau groupe"
          placeholderTextColor="white" // Ajoute une couleur pour le placeholder
          value={newGroupName}
          onChangeText={setNewGroupName}
        />
          <TouchableOpacity onPress={() => CreateNewGroup(newGroupName)} style={styles.sendButton}>
            <Text>Créer</Text>
          </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
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
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  sendButton: {
    justifyContent: 'center',
    padding: 10,
  },
});

export default GroupManagementScreen;
