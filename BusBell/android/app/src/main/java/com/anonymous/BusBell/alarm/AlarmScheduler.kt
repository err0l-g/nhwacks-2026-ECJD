package com.anonymous.BusBell.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.*

object AlarmScheduler {

    /**
     * Schedules the alarm to wake up EARLIER than the target time.
     * @param offsetMins How many minutes early to wake up (e.g., 15).
     */
    fun schedule(context: Context, id: Int, hour: Int, minute: Int, offsetMins: Int = 15) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        // 1. Set the Calendar to the ACTUAL target time first (e.g., 8:30)
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        calendar.add(Calendar.MINUTE, -offsetMins)

        if (calendar.timeInMillis <= System.currentTimeMillis()) {
            calendar.add(Calendar.DAY_OF_YEAR, 1)
        }

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra(Constants.KEY_ALARM_ID, id)
            putExtra(Constants.KEY_TARGET_HOUR, hour)
            putExtra(Constants.KEY_TARGET_MINUTE, minute)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context, id, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP, calendar.timeInMillis, pendingIntent
            )
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }
}