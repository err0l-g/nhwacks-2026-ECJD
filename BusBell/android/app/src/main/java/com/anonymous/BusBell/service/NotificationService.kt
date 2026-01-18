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

    private val TAG = "BusBellService" // Filter for this in Logcat
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var monitoringJob: Job? = null
    private val notifier by lazy { NotificationHelper(this) }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        notifier.createChannel()

        // 1. Start Foreground ASAP to prevent crash
        startForeground(Constants.NOTIF_ID_FOREGROUND, notifier.getForegroundNotification("Checking Schedule..."))

        // 2. Get ID from Intent
        val alarmId = intent?.getIntExtra(Constants.KEY_ALARM_ID, 0) ?: 0

        if (intent?.action == Constants.ACTION_ALARM_TRIGGER && alarmId != 0) {

            // LAUNCH COROUTINE TO READ DB
            serviceScope.launch(Dispatchers.IO) {

                // --- READ SQLITE ---
                val config = DatabaseRepo.getAlarmById(applicationContext, alarmId)

                if (config == null) {
                    Log.e(TAG, "Alarm $alarmId not found in DB. Stopping.")
                    stopSelf()
                    return@launch
                }

                if (!config.isEnabled) {
                    Log.i(TAG, "Alarm $alarmId is disabled. Stopping.")
                    stopSelf()
                    return@launch
                }

                // Check "Days" (e.g., is today Monday?)
                val today = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)
                if (config.days.isNotEmpty() && !config.days.contains(today)) {
                    Log.i(TAG, "Alarm $alarmId is not scheduled for today. Stopping.")
                    stopSelf()
                    return@launch
                }

                // If we pass all checks, START TRACKING using data from DB
                startTrackingLoop(
                    config.stopId,
                    config.routeId,
                    config.thresholdMins,
                    config.targetHour,
                    config.targetMinute
                )
            }
        } else {
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

            // TODO: REMOVE
            Log.i(TAG, "Loop Started. Target Timestamp: $targetTime | Max Duration: 60m")

            while (isActive) {

                if (System.currentTimeMillis() - startTime > 3600000) {
                    Log.w(TAG, "Service timed out (60m). Stopping.")
                    stopSelf()
                    break
                }

                try {

                    if (trackedTripId == null) {
                        Log.d(TAG, "Phase 1: Scanning for best trip...")
                        notifier.updateNotification("Scanning schedule...")

                        val trips = TranslinkRepo.getTripsByRouteAndStop(stopId, routeId)
                        Log.v(TAG, "Found ${trips.size} active trips for Route $routeId")

                        trackedTripId = TripCalculator.findBestTrip(trips, targetTime)

                        if (trackedTripId == null) {
                            Log.d(TAG, "No matching trip found yet. Retrying in 60s...")
                            delay(60_000L)
                            continue
                        }
                        Log.i(TAG, "Phase 1 Complete. Locked onto Trip ID: $trackedTripId")
                        notifier.updateNotification("Tracking Trip #$trackedTripId")
                    }

                    // TODO: REMOVE
                    Log.v(TAG, "Phase 2: Pinging Trip $trackedTripId...")

                    val arrivalTimeMs = TranslinkRepo.getTripEstimatedArrival(stopId, trackedTripId)

                    if (arrivalTimeMs == null) {
                        Log.w(TAG, "Trip $trackedTripId lost or cancelled. Resetting to Discovery Phase.")
                        trackedTripId = null
                        delay(10_000L)
                        continue
                    }

                    val msUntilArrival = arrivalTimeMs - System.currentTimeMillis()
                    val minsLeft = msUntilArrival / 60000

                    Log.d(TAG, "Ping Result: Arrival in ${minsLeft}m (${msUntilArrival}ms). Threshold is ${thresholdMins}m.")


                    if (msUntilArrival <= thresholdMs) {
                        Log.i(TAG, "THRESHOLD MET! Sending alert and stopping service.")
                        notifier.sendAlert("Bus Arriving!", "Bus is $minsLeft mins away.")
                        stopSelf()
                        break
                    }

                    val delayTime = if (msUntilArrival > thresholdMs + 900_000) 60_000L else 20_000L
                    delay(delayTime)

                } catch (e: Exception) {
                    Log.e(TAG, "Error in tracking loop", e)
                    delay(30_000L)
                }
            }
        }
    }

    override fun onDestroy() {
        Log.d(TAG, "onDestroy: Service stopping, cancelling jobs.")
        monitoringJob?.cancel()
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}