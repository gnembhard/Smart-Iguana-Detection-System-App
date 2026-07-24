// src/components/ScreenWrapper.js
import React from "react";
import { ScrollView } from "react-native";

const ScreenWrapper = ({ children, style = {} }) => {
  return (
    <ScrollView 
      style={[{ flex: 1, backgroundColor: '#0B1220', paddingTop: 40 }, style]} 
      contentContainerStyle={{ padding: 16 }}
    >
      {children}
    </ScrollView>
  );
};

export default ScreenWrapper;