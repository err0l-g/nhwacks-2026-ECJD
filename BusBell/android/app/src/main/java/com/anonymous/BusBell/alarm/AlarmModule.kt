package com.anonymous.BusBell.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
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
     * This method converts the data received from JavaScript (like the ReadableArray of days)
     * into native Kotlin types and hands them off to the [AlarmScheduler].
     *
     * @param id A unique integer ID for this alarm (maps to the Android PendingIntent ID).
     * @param hour The hour of the day in 24-hour format (0-23).
     * @param minute The minute of the hour (0-59).
     * @param days An array of integers representing active days (1=Sunday, 2=Monday, ...).
     * If empty, the alarm is treated as a one-time event.
     * @param stopId The ID of the bus stop to check (passed to the API later).
     * @param busRoute The bus route number to check (passed to the API later).
     */
    @ReactMethod
    fun scheduleAlarm(id: Int, hour: Int, minute: Int, days: ReadableArray, stopId: String, busRoute: String) {
        // Convert JS ReadableArray to a standard Kotlin IntArray
        val daysArray = days.toArrayList().map { it.toString().toInt() }.toIntArray()

        AlarmScheduler.schedule(
            reactApplicationContext,
            id,
            hour,
            minute,
            daysArray,
            stopId,
            busRoute,
            forceNextDay = false // False because this is a fresh request from the user; allow today.
        )
    }

    /**
     * Cancels an active alarm.
     *
     * This recreates the PendingIntent using the specific [id] and the [FLAG_NO_CREATE] flag.
     * If the intent exists, it cancels it from the AlarmManager and invalidates the intent itself.
     *
     * @param id The unique integer ID of the alarm to cancel. This must match the ID used in [scheduleAlarm].
     */
    @ReactMethod
    fun cancelAlarm(id: Int) {
        val context = reactApplicationContext
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val intent = Intent(context, AlarmReceiver::class.java)

        // FLAG_NO_CREATE returns null if the intent does not exist, preventing us from accidentally creating one just to cancel it.
        val pendingIntent = PendingIntent.getBroadcast(
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