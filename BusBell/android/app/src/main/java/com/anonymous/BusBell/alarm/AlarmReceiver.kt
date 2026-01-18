package com.anonymous.BusBell.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.ContextCompat
import com.anonymous.BusBell.service.NotificationService

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getIntExtra(Constants.KEY_ALARM_ID, 0)
        if (id == 0) return

        val serviceIntent = Intent(context, NotificationService::class.java).apply {
            Log.i("AlarmReceiver", "Waking up service")

            action = Constants.ACTION_ALARM_TRIGGER
            putExtra(Constants.KEY_ALARM_ID, id)
        }

        ContextCompat.startForegroundService(context, serviceIntent)
        val hour = intent.getIntExtra(Constants.KEY_TARGET_HOUR, 8)
        val min = intent.getIntExtra(Constants.KEY_TARGET_MINUTE, 0)
        AlarmScheduler.schedule(context, id, hour, min)
    }
}