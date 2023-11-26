// src/components/MessageBubble.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type MessageBubbleProps = {
  message: string;
  parameters: {[key: string]: string};
  type: number;
};

const styleTypeMessageByType = (type: number) => {
  if (type === 0 || type === 1){
    return styles.receivedMessage;
  }else if (type === 2 || type === 4 || type === 3){
    return styles.sentMessage;
  }
};
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message, parameters, type
}) => {
  return (
    <View style={styleTypeMessageByType(type)}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  receivedMessage: {
    backgroundColor: '#FFA500',
    alignSelf: 'flex-start',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    maxWidth: '80%',
  },
  sentMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    maxWidth: '80%',
  },
  infoMessage: {
    alignSelf: 'center',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    maxWidth: '80%',
    backgroundColor: '#f0f0f0',
    },
  userText: {
    fontWeight: 'bold',
    color: '#000',
  },
  messageText: {
    color: '#333',
    marginTop: 2,
  },
  dateText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});

export default MessageBubble;
