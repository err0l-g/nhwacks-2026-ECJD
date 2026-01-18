import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('busbell.db');

export const initDatabase = async () => {
  try {
    // Create the alarms table if it doesn't exist
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS alarms (
        id INTEGER PRIMARY KEY NOT NULL,
        label TEXT,
        time TEXT,
        days TEXT,
        threshold INTEGER,
        stopID TEXT,
        busRoute TEXT,
        stopName TEXT,
        isEnabled INTEGER
      );
    `);
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// CREATE
export const insertAlarm = async (alarm) => {
  const result = await db.runAsync(
    'INSERT INTO alarms (label, time, days, threshold, stopID, busRoute, stopName, isEnabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [alarm.label, alarm.time, alarm.days, alarm.threshold, alarm.stopID, alarm.busRoute, alarm.stopName, alarm.isEnabled ? 1 : 0]
  );
  return result.lastInsertRowId;
};

// READ
export const getAlarms = async () => {
  const allRows = await db.getAllAsync('SELECT * FROM alarms');
  return allRows.map(row => ({
    ...row,
    isEnabled: row.isEnabled === 1
  }));
};

// UPDATE (Toggle enable)
export const updateAlarmStatus = async (id, isEnabled) => {
  await db.runAsync(
    'UPDATE alarms SET isEnabled = ? WHERE id = ?',
    [isEnabled ? 1 : 0, id]
  );
};

// UPDATE (Details)
export const updateAlarm = async (id, details) => {
  try {
    await db.runAsync(
      `UPDATE alarms 
       SET label = ?, time = ?, days = ?, threshold = ?, stopID = ?, busRoute = ?, stopName = ?
       WHERE id = ?`,
      [
        details.label, 
        details.time, 
        details.days, 
        details.threshold, 
        details.stopID, 
        details.busRoute, 
        details.stopName, 
        id
      ]
    );
  } catch (error) {
    console.error("Error updating alarm details:", error);
    throw error;
  }
};

// DELETE
export const deleteAlarm = async (id) => {
  await db.runAsync('DELETE FROM alarms WHERE id = ?', [id]);
};