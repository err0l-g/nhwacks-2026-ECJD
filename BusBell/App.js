import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

function App() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to My Single-Page App!</Text>
      
      {/* Toggle between different UI components based on state */}
      {showDetails ? (
        <View>
          <Text>Details of the app go here...</Text>
          <Button title="Hide Details" onPress={() => setShowDetails(false)} />
        </View>
      ) : (
        <Button title="Show Details" onPress={() => setShowDetails(true)} />
      )}
    </View>
  );
}

export default App;