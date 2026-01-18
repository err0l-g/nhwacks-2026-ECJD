import { transit_realtime } from 'gtfs-realtime-bindings';
import { Buffer } from 'buffer';

global.Buffer = global.Buffer || Buffer;

const API_KEY = process.env.EXPO_PUBLIC_TRANSLINK_API_KEY;
const BASE_URL = "https://gtfsapi.translink.ca/v3";

export const TRANSIT_ENDPOINTS = {
  TRIP_UPDATES: 'gtfsrealtime',
  ALERTS: 'gtfsalerts'
};

const fetchTransitFeed = async (endpoint) => {
  const url = `${BASE_URL}/${endpoint}?apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API ${endpoint} failed: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const feed = transit_realtime.FeedMessage.decode(buffer);
    return feed.entity || []; 
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return []; 
  }
};

export const getAllTransitData = async () => {
  const [positions, updates, alerts] = await Promise.all([
    fetchTransitFeed(TRANSIT_ENDPOINTS.TRIP_UPDATES),
    fetchTransitFeed(TRANSIT_ENDPOINTS.ALERTS)
  ]);

  return { updates, alerts };
};