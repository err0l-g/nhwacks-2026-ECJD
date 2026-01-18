package com.anonymous.BusBell.bridge

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.anonymous.BusBell.alarm.AlarmReceiver
import com.anonymous.BusBell.alarm.AlarmScheduler
import com.facebook.react.bridge.*
import kotlin.jvm.java

/**
 * Native Module bridge for React Native JavaScript layer
 * and the Android system's AlarmManager.
 */
class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    /**
     * Name of module for use in JavaScript.
     */
    override fun getName(): String = "AlarmModule"

    /**
     * Schedules a new alarm or updates an existing one.
     *
     * @param id A unique integer ID for this alarm (maps to the Android PendingIntent ID).
     * @param hour The hour of the day in 24-hour format (0-23).
     * @param minute The minute of the hour (0-59).
     */
    @ReactMethod
    fun scheduleAlarm(id: Int, hour: Int, minute: Int) {
        // We no longer accept days/stopId/routeId here.
        // We assume React Native has ALREADY saved them to SQLite.
        AlarmScheduler.schedule(reactApplicationContext, id, hour, minute)
    }

    /**
     * Cancels an active alarm.
     *
     * @param id The unique integer ID of the alarm to cancel. This must match the ID used in [scheduleAlarm].
     */
    @ReactMethod
    fun cancelAlarm(id: Int) {
        val context = reactApplicationContext
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val intent = Intent(context, AlarmReceiver::class.java)

        val pendingIntent =
            PendingIntent.getBroadcast(
                context,
                id,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_NO_CREATE
            )

        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }
    }
}