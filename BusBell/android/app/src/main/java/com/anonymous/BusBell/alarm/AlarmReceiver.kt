package com.anonymous.BusBell.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import java.util.*

class AlarmReceiver : BroadcastReceiver() {

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

    private fun startService(context: Context, stopId: String?, busRoute: String?) {
        val serviceIntent = Intent(context, NotificationService::class.java).apply {
            action = Constants.ACTION_ALARM_TRIGGER
            putExtra("STOP_ID", stopId)
            putExtra("BUS_ROUTE", busRoute)
        }
        ContextCompat.startForegroundService(context, serviceIntent)
    }
}