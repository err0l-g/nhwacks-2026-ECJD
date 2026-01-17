import axios from "axios"
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { Buffer } from 'buffer';
global.Buffer = Buffer;


export default async function getAPI(api) {
  try {
    const response = await axios.get(api, {responseType: 'arraybuffer'})
    console.log(response.data)
    const feed = GtfsRealtimeBindings.FeedMessage.decode(new Uint8Array(response.data));
    return feed.entity
  }
  catch (error)
  {
    console.error(error)
    return []
  }
}
