package com.anonymous.BusBell.data
import android.util.Log
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
        val res = FeedMessage.parseFrom(stream)
        return res
    }

    override fun getTripsByRouteAndStop(stopId: String, routeId: String): List<TripObject> {
        refreshDataIfNeeded()
        // Main CULPRIT
        val feed = cachedUpdates ?: return emptyList()

        Log.i("TranslinkRaw", "--- START RAW FEED DUMP (Top 20 Entities) ---")
        Log.i("TranslinkRaw", "Searching for: Route: [$routeId], Stop: [$stopId]")

        feed.entityList.take(20).forEachIndexed { index, entity ->
            if (entity.hasTripUpdate()) {
                val t = entity.tripUpdate.trip
                val s = entity.tripUpdate.stopTimeUpdateList.map { it.stopId }
                Log.d("TranslinkRaw", "Trip #$index: RouteID: [${t.routeId}], TripID: [${t.tripId}], Stops in this trip: $s")
            }
        }
        Log.i("TranslinkRaw", "--- END RAW FEED DUMP ---")


        val targetRouteNumber = routeId.split(" ")[0].trimStart('0')

        return feed.entityList
            .filter { entity ->
                if (!entity.hasTripUpdate()) return@filter false

                val trip = entity.tripUpdate.trip
                val feedRouteNumber = trip.routeId.trimStart('0')

                val isCorrectRoute = feedRouteNumber == targetRouteNumber
                val servesStop = entity.tripUpdate.stopTimeUpdateList.any { it.stopId == stopId }

                isCorrectRoute && servesStop
            }
            .mapNotNull { entity ->
                val tripUpdate = entity.tripUpdate
                val stopTimeUpdate = tripUpdate.stopTimeUpdateList.find { it.stopId == stopId }

                val arrivalTimeSec = stopTimeUpdate?.arrival?.time ?: 0L
                if (arrivalTimeSec > 0) {
                    TripObject(
                        id = tripUpdate.trip.tripId,
                        expectedCountdown = arrivalTimeSec * 1000L
                    )
                } else null
            }
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