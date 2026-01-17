import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import getAPI from './services/api'
import { TRANSLINK_API_KEY } from '@env'

function App() {
  const [showDetails, setShowDetails] = useState(false);
  const [apiResult, setApiResults] = useState([]);

  useEffect(() => {
    async function loadAPI() {
      const data = await getAPI(`https://gtfsapi.translink.ca/v3/gtfsrealtime?apikey=${TRANSLINK_API_KEY}`)
      setApiResults(data)
    }
    loadAPI()
  }, []);

  return ( 
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to My Single-Page App!</Text>
      
      {showDetails ? (
        <View>
          <Text>Details of the app go here...</Text>
          <Button title="Hide Details" onPress={() => setShowDetails(false)} />
        </View>
      ) : (
        <Button title="Show Details" onPress={() => setShowDetails(true)} />
      )}
      <Text>{apiResult?.[0] ?? "none"}</Text>
    </View>
  ); 
}

export default App;