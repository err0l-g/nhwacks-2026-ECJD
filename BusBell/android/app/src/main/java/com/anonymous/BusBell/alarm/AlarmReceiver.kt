package com.anonymous.BusBell.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import com.anonymous.BusBell.service.NotificationService

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getIntExtra(Constants.KEY_ALARM_ID, 0)
        if (id == 0) return

        // 1. Simply wake up the service with the ID
        val serviceIntent = Intent(context, NotificationService::class.java).apply {
            action = Constants.ACTION_ALARM_TRIGGER
            putExtra(Constants.KEY_ALARM_ID, id)
        }

        ContextCompat.startForegroundService(context, serviceIntent)

        // 2. Reschedule for tomorrow (Repeating daily check)
        // We don't check "Days" here anymore. We just ensure the AlarmManager
        // keeps firing daily. The DB check in Service decides if we act on it.
        val hour = intent.getIntExtra(Constants.KEY_TARGET_HOUR, 8)
        val min = intent.getIntExtra(Constants.KEY_TARGET_MINUTE, 0)

        AlarmScheduler.schedule(context, id, hour, min)
    }
}