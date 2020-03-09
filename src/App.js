

import React, { Component } from 'react';
import { AsyncStorage, Alert, StyleSheet, Dimensions, FlatList, View, Text, TouchableHighlight } from 'react-native';
let deviceWidth = Dimensions.get('window').width
import Calculator from './components/Calculator'


const App = () => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  }}>
    <Calculator />
  </View>
)

export default App;