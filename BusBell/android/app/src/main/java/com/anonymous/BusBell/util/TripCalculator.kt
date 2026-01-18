package com.anonymous.BusBell.util

import com.anonymous.BusBell.data.model.TripObject
import java.util.Calendar
import kotlin.math.abs

object TripCalculator {

    fun getTargetTimestamp(hour: Int, minute: Int): Long {
        val c = Calendar.getInstance()
        c.set(Calendar.HOUR_OF_DAY, hour)
        c.set(Calendar.MINUTE, minute)
        c.set(Calendar.SECOND, 0)
        return c.timeInMillis
    }

    /**
     * Finds the trip arriving closest to the target time.
     * @param targetTimeMs The absolute timestamp (epoch) of the desired arrival.
     */
    fun findBestTrip(trips: List<TripObject>, targetTimeMs: Long): String? {
        if (trips.isEmpty()) return null

        val now = System.currentTimeMillis()

        return trips
            .filter { it.expectedCountdown >= 0 }
            .minByOrNull { trip ->
                val arrivalTime = now + trip.expectedCountdown
                abs(arrivalTime - targetTimeMs)
            }?.id
    }
}