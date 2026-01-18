package com.anonymous.BusBell.service

import android.R
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import com.anonymous.BusBell.alarm.Constants

class NotificationHelper(private val context: Context) {

    private val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                Constants.CHANNEL_ID,
                Constants.CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Real-time bus arrival notifications"
                enableVibration(true)
            }
            manager.createNotificationChannel(channel)
        }
    }

    fun getForegroundNotification(text: String): Notification {
        return NotificationCompat.Builder(context, Constants.CHANNEL_ID)
            .setContentTitle("BusBell Active")
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_menu_mylocation)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }

    fun updateNotification(text: String) {
        manager.notify(Constants.NOTIF_ID_FOREGROUND, getForegroundNotification(text))
    }

    fun sendAlert(title: String, message: String) {
        val notification = NotificationCompat.Builder(context, Constants.CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_lock_idle_alarm)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setDefaults(Notification.DEFAULT_ALL)
            .setFullScreenIntent(null, true)
            .setAutoCancel(true)
            .build()

        manager.notify(Constants.NOTIF_ID_ALERT, notification)
    }
}