import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, PermissionsAndroid, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const App = () => {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedIp, setScannedIp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [ipConfirmed, setIpConfirmed] = useState(false);
  const [message, setMessage] = useState('');

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
      }
    } else {
      setHasPermission(true); // Assuming iOS automatically requests permission
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      const ip = codes[0]?.value;
      console.log(`Scanned IP: ${ip}`);
      if (ip) {
        setScannedIp(ip);
        setIpConfirmed(true);
      }
    },
  });

  const sendMessage = async () => {
    setIsSending(true);
    try {
      await axios.post(`http://${scannedIp}:8000/message`, { message });
      Alert.alert('Success', 'Message sent to the server!');
      setMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message to the server.');
    } finally {
      setIsSending(false);
    }
  };

  if (!hasPermission) {
    return <View style={styles.container}><Text>Camera permission is required.</Text></View>;
  }

  if (!device) {
    return <View style={styles.container}><Text>Loading Camera...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {!ipConfirmed ? (
        <Camera
          device={device}
          isActive={true}
          style={StyleSheet.absoluteFill}
          codeScanner={codeScanner}
        />
      ) : (
        <View style={styles.container}>
          <Text>Current IP: {scannedIp}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your message"
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Send Message" onPress={sendMessage} disabled={isSending} />
          <Button title="Scan Another QR" onPress={() => setIpConfirmed(false)} />
        </View>
      )}
      {isSending && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Sending message...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 20,
    padding: 10,
    width: '80%',
    borderRadius: 5,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export default App;
