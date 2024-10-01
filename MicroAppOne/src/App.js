import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>MFE App One Multi-platform</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
