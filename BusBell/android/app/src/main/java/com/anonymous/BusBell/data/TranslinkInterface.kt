package com.anonymous.BusBell.data

import com.anonymous.BusBell.data.model.TripObject

interface TranslinkInterface {
    /**
     * Finds all trips for a specific route serving a specific stop.
     * @return List of TripObjects containing ID and Estimated Arrival Time (Epoch MS).
     */
    fun getTripsByRouteAndStop(stopId: String, routeId: String): List<TripObject>

    /**
     * Gets the latest estimated arrival time for a specific trip at a specific stop.
     * @return Estimated Arrival Time in Epoch Milliseconds, or null if trip/stop not found.
     */
    fun getTripEstimatedArrival(stopId: String, tripId: String): Long?

    /**
     * Checks for service alerts specific to a stop.
     * @return List of alert header texts.
     */
    fun getAlertsForStop(stopId: String): List<String>
}