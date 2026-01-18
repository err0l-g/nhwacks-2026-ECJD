package com.anonymous.BusBell.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.*
import kotlin.jvm.java

class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "AlarmModule"

    @ReactMethod
    fun scheduleAlarm(id: Int, hour: Int, minute: Int, days: ReadableArray, stopId: String, busRoute: String) {
        val daysArray = days.toArrayList().map { it.toString().toInt() }.toIntArray()

        AlarmScheduler.schedule(
            reactApplicationContext,
            id,
            hour,
            minute,
            daysArray,
            stopId,
            busRoute,
            forceNextDay = false
        )
    }

    @ReactMethod
    fun cancelAlarm(id: Int) {
        val context = reactApplicationContext
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        val intent = Intent(context, AlarmReceiver::class.java)

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