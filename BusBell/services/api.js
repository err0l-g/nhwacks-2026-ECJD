import axios from "axios";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

// export default function APITEST() {
//   const [items, setItems] = useState([]);

//   useEffect(() => {
//     async function loadAPI() {
//       const data = await getAPI("https://pokeapi.co/api/v2/ability")
//       setItems(data)
//     }
//     loadAPI()
//   }, []);

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       { 
//       console.log(items[0])
//       }
//       <Text>Welcome to My Single-Page App!</Text>
//       <Text>{items?.[0]?.name ?? "none"}</Text>
//     </View>
//   );
// }

export default async function getAPI(name) {
  try {
    const response = await axios.get(name)
    return response.data.results
  }
  catch (error)
  {
    console.log("here")
    console.error(error)
    return []
  }
}
