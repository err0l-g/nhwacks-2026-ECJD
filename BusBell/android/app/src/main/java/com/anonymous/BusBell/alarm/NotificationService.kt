package com.anonymous.BusBell.alarm

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class NotificationService : Service() {
    private val channelId = Constants.CHANNEL_ID
    private val notifIdForeground = Constants.NOTIF_ID_FOREGROUND
    private val notifIdAlert = Constants.NOTIF_ID_ALERT

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createNotificationChannel()


        val foregroundNotification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("BusBell Active")
            .setContentText("Monitoring schedule...")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(notifIdForeground, foregroundNotification)

        when (intent?.action) {
            "ACTION_ALARM_TRIGGER" -> handleAlarmTrigger()

            // TODO: Remove test actions
            "ACTION_TEST_SERVICE" -> {}
            "ACTION_TEST_NOTIFICATION" -> {
                val title = intent.getStringExtra("TITLE") ?: "Test"
                val msg = intent.getStringExtra("MESSAGE") ?: "Hello World"
                sendUserAlert(title, msg)
            }
            else -> {
                // TODO: HANDLE ERROR
            }
        }

        return START_NOT_STICKY
    }

    private fun handleAlarmTrigger() {
        // TODO: TRANSLINK API LOGIC

        sendUserAlert("Wake Up!", "Your BusBell Alarm is ringing.")
    }

    private fun sendUserAlert(title: String, message: String) {
        val manager = getSystemService(NotificationManager::class.java)
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(message)

            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .build()

        manager.notify(notifIdAlert, notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                Constants.CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}