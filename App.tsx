import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Accelerometer } from "expo-sensors";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, Vibration, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  useEffect(() => {
    const requestPersmissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("알림 권한이 필요합니다.");
      }
    };
    requestPersmissions();
  }, []);

  const startAlarm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAlarmOn(true);
    Vibration.vibrate([500, 500, 500], true);
    Notifications.scheduleNotificationAsync({
      content: {
        title: "일어나!",
        body: "알람을 끄고 싶으면 폰을 흔들어 달라구!",
      },
      trigger: {
        seconds: 1,
      },
    });
    Accelerometer.addListener(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      console.log("acceleration", acceleration);
      if (acceleration > 1.7) {
        setShakeCount((prev) => prev + 1);
      }
    });
  }, []);

  const stopAlarm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAlarmOn(false);
    setShakeCount(0);
    Vibration.cancel();
    Accelerometer.removeAllListeners();
  }, []);

  useEffect(() => {
    if (shakeCount >= 10) {
      stopAlarm();
    }
  }, [shakeCount]);

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 20,
        }}
      >
        {shakeCount}번 흔들었어요!
      </Text>
      <Button title="알람 시작" onPress={startAlarm} disabled={isAlarmOn} />
      <Button title="알람 정지" onPress={stopAlarm} disabled={!isAlarmOn} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
