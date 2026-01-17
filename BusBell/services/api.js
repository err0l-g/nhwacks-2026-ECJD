import axios from "axios"
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { Buffer } from 'buffer';
global.Buffer = Buffer;


export default async function getAPI(api) {
  try {
    const response = await axios.get(api, {responseType: 'arraybuffer'})
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(response.data));

    console.log(feed.entity[0].id)
    return feed.entity[0].id
  }
  catch (error)
  {
    console.error(error)
    return []
  }
}
