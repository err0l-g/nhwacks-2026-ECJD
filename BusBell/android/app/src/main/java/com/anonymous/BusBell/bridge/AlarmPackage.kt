package com.anonymous.BusBell.bridge

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * The Package Registrar for the BusBell Alarm System.
 */
class AlarmPackage : ReactPackage {

    /**
     * Registers our custom Native Modules (Non-UI logic).
     *
     * @param reactContext The context of the running React Native application.
     * @return A list of NativeModule instances to be exposed to JavaScript.
     */
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(AlarmModule(reactContext))
    }

    /**
     * Registers custom View Managers (UI Components).
     *
     * @param reactContext The context of the running React Native application.
     * @return An empty list, as we have no custom UI views to register.
     */
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}