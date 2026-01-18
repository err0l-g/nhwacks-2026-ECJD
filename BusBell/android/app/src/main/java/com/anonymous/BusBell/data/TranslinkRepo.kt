package com.anonymous.BusBell.data
import com.google.transit.realtime.GtfsRealtime.FeedMessage
import com.anonymous.BusBell.BuildConfig
import com.anonymous.BusBell.data.model.TripObject
import java.net.URL

object TranslinkRepo : TranslinkInterface {
    private const val API_KEY = BuildConfig.TRANSLINK_API_KEY
    private const val BASE_URL = "https://gtfsapi.translink.ca/v3"
    private var cachedUpdates: FeedMessage? = null
    private var cachedAlerts: FeedMessage? = null
    private var lastFetchTime = 0L
    private const val CACHE_DURATION_MS = 120_000L

    /**
     * Internal helper to refresh data if cache is stale.
     * Synchronized to prevent multiple threads fetching simultaneously.
     */
    @Synchronized
    private fun refreshDataIfNeeded() {
        val now = System.currentTimeMillis()
        if (cachedUpdates == null || (now - lastFetchTime > CACHE_DURATION_MS)) {
            try {
                cachedUpdates = fetchFeed("gtfsrealtime")
                cachedAlerts = fetchFeed("gtfsalerts")
                lastFetchTime = now
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun fetchFeed(endpoint: String): FeedMessage {
        val url = URL("$BASE_URL/$endpoint?apikey=$API_KEY")
        val stream = url.openStream()
        return FeedMessage.parseFrom(stream)
    }

    override fun getTripsByRouteAndStop(stopId: String, routeId: String): List<TripObject> {
        refreshDataIfNeeded()
        val feed = cachedUpdates ?: return emptyList()
        val results = ArrayList<TripObject>()

        for (entity in feed.entityList) {
            if (!entity.hasTripUpdate()) continue

            val tripUpdate = entity.tripUpdate
            val trip = tripUpdate.trip

            if (trip.routeId != routeId) continue

            val stopTimeUpdate = tripUpdate.stopTimeUpdateList.find { it.stopId == stopId }

            if (stopTimeUpdate != null) {
                val arrivalTimeSec = stopTimeUpdate.arrival?.time ?: 0L
                if (arrivalTimeSec > 0) {
                    results.add(
                        TripObject(
                            id = trip.tripId,
                            expectedCountdown = arrivalTimeSec * 1000L
                        )
                    )
                }
            }
        }
        return results
    }

    override fun getTripEstimatedArrival(stopId: String, tripId: String): Long? {
        refreshDataIfNeeded()
        val feed = cachedUpdates ?: return null

        val entity = feed.entityList.find {
            it.hasTripUpdate() && it.tripUpdate.trip.tripId == tripId
        } ?: return null

        val stopData = entity.tripUpdate.stopTimeUpdateList.find { it.stopId == stopId }

        val timeSec = stopData?.arrival?.time ?: return null
        return timeSec * 1000L
    }

    override fun getAlertsForStop(stopId: String): List<String> {
        refreshDataIfNeeded()
        val feed = cachedAlerts ?: return emptyList()
        val alerts = ArrayList<String>()

        for (entity in feed.entityList) {
            if (!entity.hasAlert()) continue

            val alert = entity.alert

            val affectsStop = alert.informedEntityList.any { it.stopId == stopId }

            if (affectsStop) {
                val text = alert.headerText.translationList.firstOrNull()?.text
                    ?: "Service Interruption"
                alerts.add(text)
            }
        }
        return alerts
    }
}