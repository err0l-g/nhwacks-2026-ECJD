package com.anonymous.BusBell.alarm

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Persistent Foreground Service for sending notifications to the user.
 */
class NotificationService : Service() {
    private val channelId = Constants.CHANNEL_ID
    private val notifIdForeground = Constants.NOTIF_ID_FOREGROUND
    private val notifIdAlert = Constants.NOTIF_ID_ALERT

    /**
     * Entry point for the service.
     *
     * @param intent The Intent passed by [AlarmReceiver], containing the action string and extras.
     * @param flags Additional data about this start request.
     * @param startId A unique integer representing this specific request to start.
     * @return [START_NOT_STICKY] - If the system kills this service for memory, do NOT restart it automatically.
     * We prefer to wait for the next precise AlarmManager trigger rather than restarting with an empty intent.
     */
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createNotificationChannel()

        val foregroundNotification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("BusBell Active")
            .setContentText("Monitoring schedule...")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setPriority(NotificationCompat.PRIORITY_LOW) // Low priority to be less intrusive
            .build()

        startForeground(notifIdForeground, foregroundNotification)

        when (intent?.action) {
            Constants.ACTION_ALARM_TRIGGER -> handleAlarmTrigger()

            else -> {
                // TODO: Handle other actions
                // stopSelf()?
            }
        }

        return START_NOT_STICKY
    }

    /**
     * Alarm trigger logic.
     */
    private fun handleAlarmTrigger() {
       // TODO: TRANSLINK API calling and parsing

        sendUserAlert("Wake Up!", "Your BusBell Alarm is ringing.")
    }

    /**
     * Sends a notification to the user with the given title and message.
     *
     * @param title The bold title text of the alert.
     * @param message The body text explaining the alert.
     */
    private fun sendUserAlert(title: String, message: String) {
        val manager = getSystemService(NotificationManager::class.java)
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true) // Removes the notification when the user taps it
            .build()

        manager.notify(notifIdAlert, notification)
    }

    /**
     * Registers the Notification Channel with the Android OS.
     */
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

    /**
     * Required override for Services.
     */
    override fun onBind(intent: Intent?): IBinder? = null
}