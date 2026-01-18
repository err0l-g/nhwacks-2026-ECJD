import { getAllTransitData } from './live-data-api.js';

/**
 * 
 * @param {*} stopId id of user-selected bus stop
 * @param {*} routeId id of user-selected bus trip
 * @returns eta for stop/trip and alerts for stop
 */

let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 120000; //2 minutes

/**
 * Internal helper to ensure we have fresh data
 */
const refreshDataIfNeeded = async () => {
    const now = Date.now();
    if (!cachedData || (now - lastFetchTime > CACHE_DURATION)) {
        cachedData = await getAllTransitData();
        lastFetchTime = now;
    }
    return cachedData;
};


/**
 * Finds all active trips for a specific route that serve a specific stop.
 * 
 * @param {*} routeId The route the user is interested in (e.g., "99").
 * @param {*} stopId The stop the user is at (e.g., "50031").
 * @returns {Array<*>} A list of tripIds for the route that passes by the stop.
 */
export const getTripsByRouteAndStop = async (stopId, routeId) => {
    const data = await refreshDataIfNeeded();
    if (!data.updates) return [];

    return data.updates
        .filter(update => {
            const trip = update?.tripUpdate?.trip;
            const stops = update?.tripUpdate?.stopTimeUpdate;

            // check for route
            const isCorrectRoute = trip?.routeId === routeId;
            // check for stop
            const servesStop = stops?.some(stop => stop.stopId === stopId);

            return isCorrectRoute && servesStop;
        })
        .map(update => {
            const tripId = update.tripUpdate.trip.tripId;
            // Extract the arrival time for this specific trip at this specific stop
            const stopData = update.tripUpdate.stopTimeUpdate.find(stop => stop.stopId === stopId);
            
            return {
                tripId: tripId,
                estimatedArrival: stopData?.arrival?.time ? parseInt(stopData.arrival.time) : null
            };
        })
        .filter(trip => trip.estimatedArrival !== null);
};



/**
 * Once a tripId is selected, call this constantly to see it approach.
 */
export const getLiveStatus = async (stopId, tripId) => {
    const data = await refreshDataIfNeeded();

    const eta = getTripEstimatedArrival(data.updates, stopId, tripId);
    const alerts = checkForAlerts(data.alerts, stopId);

    return { eta, alerts };
};


/**
 * Tracks the specific bus trip
 * 
 * @param {*} tripUpdates trip information passed in from live data
 * @param {*} stopId id of user-selected bus stop
 * @param {*} routeId id of user-selected bus trip
 * @returns alert text pertaining to the stop
 */

export const getTripEstimatedArrival = async (tripUpdates, stopId, tripId) => {
    if (!tripUpdates) return null;

    const selectedTrip = tripUpdates.find(update =>
        update?.tripUpdate?.trip?.tripId === tripId
    );

    if (!selectedTrip) return null;

    const stopData = selectedTrip.tripUpdate.stopTimeUpdate?.find(stop =>
        stop.stopId === stopId
    );

    return stopData?.arrival?.time ? parseInt(stopData.arrival.time) : null;
};

/**
 * Checks for alerts for the provided stop
 * 
 * @param {*} serviceAlerts alerts list passed in from live data
 * @param {*} stopId user-selected stopId
 * @returns alert text pertaining to the stop
 */

export const checkForAlerts = async (serviceAlerts, stopId) => {
    if (!serviceAlerts || !Array.isArray(serviceAlerts)) return [];

    const relevantAlerts = serviceAlerts.filter(serviceAlert =>
        serviceAlert?.alert?.informedEntity?.some(entity =>
            entity.stopId === stopId
        )
    );

    return relevantAlerts.map(item => {
        const translations = item.alert?.headerText?.translation;
        if (Array.isArray(translations)) {
            return translations[0]?.text || "Service alert recorded.";
        }
        return translations?.text || "Service interruption.";
    });
};