package com.anonymous.BusBell.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.*

object AlarmScheduler {

    /**
     * Schedules an alarm.
     * @param forceNextDay If true, ensures the alarm cannot be scheduled for today (used by Receiver).
     */
    fun schedule(
        context: Context,
        id: Int,
        hour: Int,
        minute: Int,
        days: IntArray,
        stopId: String?,
        busRoute: String?,
        forceNextDay: Boolean = false
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val calendar = Calendar.getInstance()

        calendar.set(Calendar.HOUR_OF_DAY, hour)
        calendar.set(Calendar.MINUTE, minute)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)

        if (calendar.timeInMillis <= System.currentTimeMillis() || forceNextDay) {
            calendar.add(Calendar.DAY_OF_YEAR, 1)
        }

        // Resets the alarm to the next chosen reoccurring day.
        if (days.isNotEmpty()) {
            for (i in 0..7) {
                val dayToCheck = calendar.get(Calendar.DAY_OF_WEEK)
                if (days.contains(dayToCheck)) {
                    break
                }

                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }
        }

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra("ALARM_ID", id)
            putExtra("DAYS", days)
            putExtra("HOUR", hour)
            putExtra("MINUTE", minute)
            putExtra("STOP_ID", stopId)
            putExtra("BUS_ROUTE", busRoute)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                pendingIntent
            )
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }
}