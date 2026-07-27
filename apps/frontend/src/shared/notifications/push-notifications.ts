import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const ANDROID_CHANNEL_ID = 'default'

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  })
}

// Requests permission and returns an Expo push token for this device, or null
// if the device can't receive push (simulator/emulator) or permission was denied.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  await ensureAndroidChannel()

  if (!Device.isDevice) {
    return null
  }

  const { granted } = await Notifications.getPermissionsAsync()
  const isGranted = granted || (await Notifications.requestPermissionsAsync()).granted

  if (!isGranted) {
    return null
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
    return token
  } catch (error) {
    console.warn('Failed to obtain Expo push token', error)
    return null
  }
}
