package com.anonymous.BusBell.data

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import java.util.Calendar

/**
 * Reads the React Native SQLite database directly.
 */
object DatabaseRepo {

    // Adjust this filename to match your React Native SQLite configuration!
    private const val DB_NAME = "BusBell.db"

    data class AlarmConfig(
        val id: Int,
        val stopId: String,
        val routeId: String,
        val thresholdMins: Int,
        val days: IntArray,
        val isEnabled: Boolean,
        val targetHour: Int,
        val targetMinute: Int
    )

    fun getAlarmById(context: Context, alarmId: Int): AlarmConfig? {
        val dbFile = context.getDatabasePath(DB_NAME)
        if (!dbFile.exists()) return null

        val db = SQLiteDatabase.openDatabase(dbFile.path, null, SQLiteDatabase.OPEN_READONLY)
        var config: AlarmConfig? = null

        try {
            // QUERY: Select specific columns using the ID
            val cursor = db.rawQuery(
                "SELECT stopID, busRoute, threshold, days, time, isEnabled FROM AlarmsTable WHERE d = ?",
                arrayOf(alarmId.toString())
            )

            if (cursor.moveToFirst()) {
                val stopId = cursor.getString(0)
                val routeId = cursor.getString(1)
                val thresholdMs = cursor.getInt(2)
                val daysString = cursor.getString(3)
                val timeIso = cursor.getString(4)
                val enabledInt = cursor.getInt(5)

                val daysArray = parseDaysString(daysString)

                val (hour, minute) = parseTime(timeIso)

                config = AlarmConfig(
                    id = alarmId,
                    stopId = stopId,
                    routeId = routeId,
                    thresholdMins = thresholdMs / 60000, // Convert MS -> Mins
                    days = daysArray,
                    isEnabled = enabledInt > 0,
                    targetHour = hour,
                    targetMinute = minute
                )
            }
            cursor.close()
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            db.close()
        }
        return config
    }

    // Helper: Converts "M-W-F--" to Android Calendar constants
    // Sunday=1, Monday=2, ... Saturday=7
    private fun parseDaysString(fmt: String): IntArray {
        val days = ArrayList<Int>()
        // Simple mapping based on index. "SMTWTFS"
        // If your string is exactly 7 chars: "SMTWTFS"
        if (fmt.length >= 7) {
            if (fmt[0] != '-') days.add(Calendar.SUNDAY)    // Index 0
            if (fmt[1] != '-') days.add(Calendar.MONDAY)    // Index 1
            if (fmt[2] != '-') days.add(Calendar.TUESDAY)
            if (fmt[3] != '-') days.add(Calendar.WEDNESDAY)
            if (fmt[4] != '-') days.add(Calendar.THURSDAY)
            if (fmt[5] != '-') days.add(Calendar.FRIDAY)
            if (fmt[6] != '-') days.add(Calendar.SATURDAY)
        }
        return days.toIntArray()
    }

    private fun parseTime(timeStr: String): Pair<Int, Int> {
        // Dummy logic: You need to implement strict parsing based on your DB format
        // Example: if stored as "08:30"
        val parts = timeStr.substringAfter("T").split(":")
        return Pair(parts[0].toInt(), parts[1].toInt())
    }
}