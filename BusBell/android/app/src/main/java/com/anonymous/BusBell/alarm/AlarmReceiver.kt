package com.anonymous.BusBell.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import java.util.*

/**
 * Lightweight class to handle Android AlarmManager.
 */
class AlarmReceiver : BroadcastReceiver() {

    /**
     * Called automatically by the Android OS when the alarm triggers.
     *
     * @param context The Context in which the receiver is running.
     * @param intent The Intent being received, containing the extras we packed in [AlarmScheduler]
     * (ALARM_ID, HOUR, MINUTE, DAYS, STOP_ID, BUS_ROUTE).
     */
    override fun onReceive(context: Context, intent: Intent) {

        val id = intent.getIntExtra("ALARM_ID", 0)
        val hour = intent.getIntExtra("HOUR", -1)
        val minute = intent.getIntExtra("MINUTE", -1)
        val days = intent.getIntArrayExtra("DAYS") ?: intArrayOf()
        val stopId = intent.getStringExtra("STOP_ID")
        val busRoute = intent.getStringExtra("BUS_ROUTE")


        if (id == 0 || hour == -1) return


        val today = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)

        if (days.isEmpty() || days.contains(today)) {
            startService(context, stopId, busRoute)
        }

        if (days.isNotEmpty()) {
            AlarmScheduler.schedule(
                context,
                id,
                hour,
                minute,
                days,
                stopId,
                busRoute,
                forceNextDay = true
            )
        }
    }

    /**
     * Helper method to start the NotificationService.
     *
     * @param context Application context.
     * @param stopId The Bus Stop ID to check.
     * @param busRoute The Bus Route number to check.
     */
    private fun startService(context: Context, stopId: String?, busRoute: String?) {
        val serviceIntent = Intent(context, NotificationService::class.java).apply {
            // Set the specific action so the service knows this is a Real Alarm trigger
            action = Constants.ACTION_ALARM_TRIGGER
            putExtra("STOP_ID", stopId)
            putExtra("BUS_ROUTE", busRoute)
        }

        // ContextCompat.startForegroundService is required for Android 8.0+ (Oreo) compatibility.
        // The service must call startForeground() within 5 seconds or the app will crash.
        ContextCompat.startForegroundService(context, serviceIntent)
    }
}