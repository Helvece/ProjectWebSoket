// src/screens/ChatScreen.tsx

import React, { useEffect, useState } from 'react';
import { View,Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import MessageBubble from '../components/MessageBubble';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import ChatHeader from '../components/ChatHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getSocket, decodeAsync, encodeAsync} from "../utils/socket"
import Icon from 'react-native-vector-icons/FontAwesome';
import { 
  IPacket,
  IStatusChannelPacket,
  IListChannelPacket,
  IJoinChannelPacket,
  StatusChannelType,
  ChannelType,
  ITextPacket,
  TextPacketType
} from "../packet/index";

type Props = StackScreenProps<RootStackParamList, 'Chat'>;

type Message = {
  message: string;
  parameters: { [key: string]: string };
  type: number;
};
  
const ChatScreen: React.FC<Props> = ({  route, navigation }) => {
  const  {groupName, user} = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(''); // Nom d'utilisateur actuel
  
  useEffect(() => {
    const socket = getSocket();
    const fetchMessagesPrivate = async () => {
      if (user == undefined || groupName != undefined) {
        return;
      }
      const privateMessage = await AsyncStorage.getItem("private") ?? "{}";
      const privateMessageArray = JSON.parse(privateMessage) as {[key: string]: Message[]};
      if(privateMessageArray[user] != undefined){
        setMessages(privateMessageArray[user]);
      }
    };
    const handleCustomEvent =  async (buffer: Uint8Array) => {

    const packet: IPacket = await decodeAsync(buffer);
    if (packet.networkId == "text_packet") {
      const textPacket: ITextPacket = packet as ITextPacket;
      if(textPacket.type == TextPacketType.TYPE_CHAT || textPacket.type == TextPacketType.TYPE_BROADCAST_CHANEL){
        if(textPacket.parameters?.channel != groupName){
          return;
        }
      }else if(textPacket.type == TextPacketType.TYPE_PRIVATE_CHAT){
        const _private: string | undefined = textPacket.parameters?.private;
        if(_private == undefined){
          return;
        }
        const privateMessage = await AsyncStorage.getItem("private") ?? "{}";
        const privateMessageArray = JSON.parse(privateMessage) as {[key: string]: Message[]};
        if(privateMessageArray[_private] == undefined){
          privateMessageArray[_private] = [];
        }
        privateMessageArray[_private] = [...privateMessageArray[_private], {message: textPacket.message, parameters: textPacket.parameters, type: textPacket.type} as Message];
        await AsyncStorage.setItem("private", JSON.stringify(privateMessageArray));
        if(_private != user){
          return;
        }
        setMessages((pp) => [...pp, { message: textPacket.message, parameters: textPacket.parameters, type: textPacket.type} as Message]);
        return;
      }
      setMessages((pp) => [...pp, { message: textPacket.message, parameters: textPacket.parameters, type: textPacket.type} as Message]);
    }else if(packet.networkId === "join_channel_packet") {
      const joinChannelPacket: IJoinChannelPacket = packet as IJoinChannelPacket;
      navigation.navigate("Chat", { groupName: joinChannelPacket.channel });
    }
  };
  socket.on("packet", handleCustomEvent);
  fetchMessagesPrivate();
    return () => {
      console.log('Component will unmount, cleaning up...');
      // Désabonner l'événement pour éviter les fuites de mémoire
      socket.off('packet', handleCustomEvent);
    };
  }, [groupName, user]);
  const handleSend = () => {
      // Ajoute la logique pour envoyer un nouveau message
      if (newMessage.trim() === '') {
        return;
      }
      const newMessageObject = {
        networkId: "text_packet",
        message: newMessage.trimStart(), // Utiliser le nom d'utilisateur récupéré
        type: groupName != undefined ? TextPacketType.TYPE_CHAT : TextPacketType.TYPE_PRIVATE_CHAT,
        parameters: groupName != undefined ? {} : {"target": user}
      };
      encodeAsync<Uint8Array>(newMessageObject).then((message) =>
        getSocket().emit('packet', message)
      );
      setNewMessage(''); // Réinitialise le champ de texte
  };

  const handleGroupManagement = async () => {
    try {
      // vide les messages
      setMessages([]);
      navigation.navigate('GroupManagement');
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserManagement = async () => {
    try {
      // vide les messages
      setMessages([]);
      navigation.navigate('UserManagement');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
    <ChatHeader 
      title={groupName != undefined ? groupName :`Chat privé avec ${user}`}
      isGlobalChat={true} /> 
      {/* Zone de liste de messages */}
      <View   style={styles.messageListContainer}>
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <MessageBubble
              message={item.message}
              parameters={item.parameters as any}
              type={item.type}
            />
          )}
        />
      </View  >
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={()=>{}} style={styles.groupButton}>
          <Icon name="gamepad" size={24} color="#000" />
        </TouchableOpacity>
      <TouchableOpacity onPress={handleGroupManagement} style={styles.groupButton}>
        <Icon name="group" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleUserManagement} style={styles.groupButton}>
        <Icon name="user" size={24} color="#000" />
      </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Écrivez votre message ici"
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageListContainer: {
    flex: 1, // Utilise l'espace disponible entre le header et la zone de saisie
    paddingHorizontal: 10,
  },
  groupButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
  },
  sendButton: {
    justifyContent: 'center',
    padding: 10,
  },
});

export default ChatScreen;
