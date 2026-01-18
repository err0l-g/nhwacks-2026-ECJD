package com.anonymous.BusBell.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.anonymous.BusBell.alarm.Constants
import com.anonymous.BusBell.util.TripCalculator
import com.anonymous.BusBell.data.DatabaseRepo
import com.anonymous.BusBell.data.TranslinkRepo
import kotlinx.coroutines.*
import java.util.Calendar

class NotificationService : Service() {

    private val TAG = "BusBellService"
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var monitoringJob: Job? = null
    private val notifier by lazy { NotificationHelper(this) }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        notifier.createChannel()
        startForeground(Constants.NOTIF_ID_FOREGROUND, notifier.getForegroundNotification("Checking Schedule..."))

        val alarmId = intent?.getIntExtra(Constants.KEY_ALARM_ID, 0) ?: 0
        Log.i(TAG, "Service started for Alarm ID: $alarmId")

        if (intent?.action == Constants.ACTION_ALARM_TRIGGER && alarmId != 0) {
            serviceScope.launch(Dispatchers.IO) {
                val config = DatabaseRepo.getAlarmById(applicationContext, alarmId)
                if (config == null) {
                    Log.i(TAG, "Shutting down: Alarm $alarmId not found in database")
                    stopSelf()
                    return@launch
                }

                if (!config.isEnabled) {
                    Log.i(TAG, "Shutting down: Alarm $alarmId is explicitly disabled")
                    stopSelf()
                    return@launch
                }

                val today = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)
                if (config.days.isNotEmpty() && !config.days.contains(today)) {
                    Log.i(TAG, "Shutting down: Today ($today) is not in scheduled days for Alarm $alarmId")
                    stopSelf()
                    return@launch
                }

                Log.i(TAG, "Valid alarm configuration found. Starting tracking loop for Route: ${config.routeId}")
                startTrackingLoop(
                    config.stopId,
                    config.routeId,
                    config.thresholdMins,
                    config.targetHour,
                    config.targetMinute
                )
            }
        } else {
            Log.i(TAG, "Service received invalid action or ID. Self-stopping.")
            stopSelf()
        }

        return START_NOT_STICKY
    }

    private fun startTrackingLoop(stopId: String, routeId: String, thresholdMins: Int, hour: Int, minute: Int) {
        monitoringJob?.cancel()
        monitoringJob = serviceScope.launch {
            val thresholdMs = thresholdMins * 60 * 1000L
            val targetTime = TripCalculator.getTargetTimestamp(hour, minute)
            var trackedTripId: String? = null
            val startTime = System.currentTimeMillis()

            Log.i(TAG, "Tracking loop initiated. Target Time: $hour:$minute, Threshold: ${thresholdMins}m")

            while (isActive) {
                if (System.currentTimeMillis() - startTime > 3600000) {
                    Log.i(TAG, "Safety timeout reached (60m). Stopping tracking.")
                    stopSelf()
                    break
                }

                try {
                    if (trackedTripId == null) {
                        Log.i(TAG, "Phase 1: Searching for best trip for Route $routeId at Stop $stopId")
                        notifier.updateNotification("Scanning schedule...")

                        val trips = TranslinkRepo.getTripsByRouteAndStop(stopId, routeId)
                        trackedTripId = TripCalculator.findBestTrip(trips, targetTime)

                        if (trackedTripId == null) {
                            Log.i(TAG, "No suitable trip found in feed. Retrying in 60s.")
                            delay(60_000L)
                            continue
                        }
                        Log.i(TAG, "Phase 1 Complete: Locked onto Trip ID $trackedTripId")
                        notifier.updateNotification("Tracking Trip #$trackedTripId")
                    }

                    val arrivalTimeMs = TranslinkRepo.getTripEstimatedArrival(stopId, trackedTripId)

                    if (arrivalTimeMs == null) {
                        Log.i(TAG, "Trip $trackedTripId disappeared from feed. Returning to Phase 1.")
                        trackedTripId = null
                        delay(10_000L)
                        continue
                    }

                    val msUntilArrival = arrivalTimeMs - System.currentTimeMillis()
                    val minsLeft = msUntilArrival / 60000
                    Log.i(TAG, "Phase 2 Update: Trip $trackedTripId is $minsLeft mins away (Threshold: ${thresholdMins}m)")

                    if (msUntilArrival <= thresholdMs) {
                        Log.i(TAG, "Alert condition met! Sending notification and stopping service.")
                        notifier.sendAlert("Bus Arriving!", "Bus is $minsLeft mins away.")
                        stopSelf()
                        break
                    }

                    val delayTime = if (msUntilArrival > thresholdMs + 900_000) 60_000L else 20_000L
                    delay(delayTime)

                } catch (e: Exception) {
                    Log.i(TAG, "Error encountered in tracking loop: ${e.message}")
                    delay(30_000L)
                }
            }
        }
    }

    override fun onDestroy() {
        Log.i(TAG, "Service onDestroy called. Cleaning up jobs.")
        monitoringJob?.cancel()
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}