import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const App = () => {
  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedIp, setScannedIp] = useState('');
  const [ipConfirmed, setIpConfirmed] = useState(false);

  useEffect(() => {
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
        setHasPermission(true);
      }
    };
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

  const sendCommand = async (message) => {
    try {
      await axios.post(`http://${scannedIp}:8000/message`, { message });
    } catch (error) {
      Alert.alert('Error', 'Failed to send command to the server.');
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
      <Text style={styles.header}>WIFI SCANNER</Text>
      {!ipConfirmed ? (
        <View style={styles.scannerContainer}>
          <Camera
            device={device}
            isActive={true}
            style={styles.cameraStyle}
            codeScanner={codeScanner}
          />
        </View>
      ) : (
        <View style={styles.messageContainer}>
          <Text style={styles.ipText}>Current IP: {scannedIp}</Text>
          <View style={styles.commandButtonsContainer}>
            <TouchableOpacity style={styles.commandButton} onPress={() => sendCommand('UP')}>
              <Text>UP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commandButton} onPress={() => sendCommand('DOWN')}>
              <Text>DOWN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commandButton} onPress={() => sendCommand('LEFT')}>
              <Text>LEFT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commandButton} onPress={() => sendCommand('RIGHT')}>
              <Text>RIGHT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commandButton} onPress={() => sendCommand('ON')}>
              <Text>ON</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commandButton} onPress={() => sendCommand('OFF')}>
              <Text>OFF</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraStyle: {
    width: '100%',
    aspectRatio: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    paddingTop: 20,
    paddingBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#FFF',
    color: '#000',
    marginBottom: 20,
    padding: 10,
    width: '80%',
    borderRadius: 5,
  },
  messageContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  ipText: {
    color: '#000',
    marginBottom: 15,
    fontSize: 16,
  },
  commandButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  commandButton: {
    margin: 5,
    borderWidth: 1,
    borderColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
});

export default App;
