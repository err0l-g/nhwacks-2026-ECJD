package com.anonymous.BusBell.alarm

object Constants {
    const val CHANNEL_ID = "bus_bell_channel_01"
    const val CHANNEL_NAME = "BusBell Alerts"

    // Notification IDs
    const val NOTIF_ID_FOREGROUND = 1001
    const val NOTIF_ID_ALERT = 2001

    // Actions
    const val ACTION_ALARM_TRIGGER = "com.anonymous.BusBell.ACTION_ALARM_TRIGGER"

    // Intent Extras Keys
    const val KEY_ALARM_ID = "ALARM_ID"
    const val KEY_TARGET_HOUR = "TARGET_HOUR"
    const val KEY_TARGET_MINUTE = "TARGET_MINUTE"
}