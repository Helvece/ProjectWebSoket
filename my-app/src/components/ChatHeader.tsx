// src/components/ChatHeader.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type ChatHeaderProps = {
  title: string;
  isGlobalChat: boolean;
};

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, isGlobalChat }) => {
  return (
    <View style={styles.container}>
      <FontAwesome
        name={isGlobalChat ? "globe" : "users"}
        size={24}
        color="black"
      />
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  text: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatHeader;
