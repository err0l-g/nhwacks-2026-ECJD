package com.anonymous.BusBell.data.model

data class TripObject(
    val id: String,
    val expectedCountdown: Long,
) {
    // Helper to get minutes for logging/display
    val minutes: Long get() = expectedCountdown / 60000
}