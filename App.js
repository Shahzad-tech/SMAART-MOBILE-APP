/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


import React, { Component, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';


import {
  AppRegistry,
  StyleSheet,
  Text,
  BackHandler,
  TouchableOpacity,
  Image,
  Video,
  ActivityIndicator,
  FileReader,
  Linking, ImageBackground, View, Button, Alert,
  PermissionsAndroid, Platform
} from 'react-native';


import RNFetchBlob from 'rn-fetch-blob';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import SweetAlert from 'react-native-sweet-alert';
console.disableYellowBox = true;

const axios = require('axios').default;


const ip = 'http://192.168.10.27:5000'



const ScanScreen2 = ({ navigation }) => {


  const [Load, setload] = useState()
  const [flash, setflash] = useState(0)


  const onSuccess = (e) => {

    setload(true)

    axios.get(`${ip}/qrcode/getimage/` + e.data).then((response) => {
      
      // alert("foundd")
      setload(false)
      navigation.navigate('ImageScreen', response.data)


    }).catch((err) => {
      console.log(err)
    })

  }

  if (Load) {
    return (
      <ImageBackground source={require('./assets/backgroundImage.jpg')} style={styles.container}>
        <ActivityIndicator size="large" color="red" />
        <Text style={styles.textBoldActivity}>Loading Data from Server ...</Text>
      </ImageBackground>
    )
  }

  return (
    <ImageBackground source={require('./assets/backgroundImage.jpg')} style={styles.container}>
    <QRCodeScanner
      onRead={(e) => { onSuccess(e) }}
      reactivate={true}
      reactivateTimeout={5000}
      flashMode={flash == 1 ? RNCamera.Constants.FlashMode.torch : null}
      topContent={
        <View>
          <Text style={styles.centerText}>
            <Text style={styles.textBold}>Scan the Qr Code to Download Image</Text>
          </Text>

        </View>
      }
      bottomContent={
        <View style={{ flexDirection: "row" }}>

          <TouchableOpacity style={styles.buttonTouchableScanScreen} onPress={() => { flash == 1 ? setflash(0) : setflash(1) }}>
            <Ionicons name="flashlight-outline" size={30} color="#088F8F"></Ionicons>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonTouchableScanScreen} onPress={() => { BackHandler.exitApp(); }}>
            <MaterialCommunityIcons name="location-exit" size={30} color="#900"></MaterialCommunityIcons>
          </TouchableOpacity>

        </View>
        

      }
    />
    </ImageBackground>
  

  
  )

}

const ShowImage = ({ route, navigation }) => {

  var name = route.params;
  // alert(name)


  const downloadImage = () => {
    var date = new Date()
    var imageUrl = `${ip}/qrimagesFolder/${name}`
    var extension = getExten(imageUrl)
    // alert(extension)
    extension = "." + extension[0]

    const { config, fs } = RNFetchBlob
    let PictureDir = fs.dirs.PictureDir
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: PictureDir + "/image_" + Math.floor(date.getTime() + date.getSeconds() / 2) + extension,
        description: 'Image'

      }
    }
    config(options).fetch('GET', imageUrl)
      .then(res => {
        console.log(JSON.stringify(res))
        SweetAlert.showAlertWithOptions({
          title: 'Download Successful',
          subTitle: 'Image downloaded successfully.',
          confirmButtonTitle: 'OK',
          confirmButtonColor: '#000',
          style: 'success',

        })

      })

  }

  const permissionCheck = async () => {
    if (Platform.OS === 'ios') {
      downloadImage()
    }
    else {
      try {
        const grant = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
          title: "Storage Permission Required",
          message: "Smaart needs to access storage location"
        }
        )
        if (grant == PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Storage Permission Allowed")
          downloadImage()
        }
        else {
          alert("No storage permission access.")
        }


      } catch (err) {

      }
    }
  }



  const getExten = (filename) => {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined
  }



  return (

    <ImageBackground source={require('./assets/backgroundImage.jpg')} style={styles.container}>

      <TouchableOpacity
          style={styles.buttonImageDisplayScreenScanner}
          onPress={() => { navigation.navigate("ScanScreen") }}
        >
          <Text style={{ fontWeight: '100', color: '#000', fontSize: 20 }}>Open Scanner Again
          </Text>
            <View style={styles.iconsImageDisplay}>
              <MaterialIcons name="qr-code-scanner" size={25} color="#87CEFA"></MaterialIcons>
            </View>
        </TouchableOpacity>
     
       <Image style={{ width: "100%", height: 250, resizeMode: 'stretch', marginBottom: "15%", marginTop:"15%"}} source={{ uri: `${ip}/qrimagesFolder/${name}` }} />
      <View>
        <TouchableOpacity
          style={styles.buttonImageDisplayScreenDownload}
          onPress={() => { permissionCheck() }}
        >
          <Text style={{ fontWeight: '100', color: '#000', fontSize: 20 }}>Download Image   
          </Text>
          <View style={styles.iconsImageDisplay}> 
            <Feather name="download-cloud" size={25} color="#088F8F"></Feather>
          </View>
        </TouchableOpacity>
      </View>
     </ImageBackground>

  )




}

const Stack = createNativeStackNavigator();

function App() {

  return (
    <NavigationContainer >
      <Stack.Navigator initialRouteName="Home" screenOptions={{headerLeft:()=>null, headerTitleAlign:"center", headerTintColor:"silver", headerStyle:{backgroundColor:"#FFE4E1", fontWeight:"100"}}}>
        <Stack.Screen name="ScanScreen" component={ScanScreen2} options={{title:"SMAART"}}/>
        <Stack.Screen name="ImageScreen" component={ShowImage} options={{title:"SMAART", headerLeft:()=>false, 
        headerRight:()=>( 
        <TouchableOpacity onPress={() => { BackHandler.exitApp(); }}>
            <MaterialCommunityIcons name="location-exit" size={23} color="#900"></MaterialCommunityIcons>
        </TouchableOpacity>
                )}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({

  container: {
    alignItems: 'center',
    justifyContent: "center",
    flex: 1,
    width: null,
    height: null
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '100',
    color: '#000'
  },
  textBoldActivity: {
    fontWeight: '100',
    color: '#000',
    marginTop: "4%"
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  },
  buttonTouchableScanScreen: {
    padding: 50,
    marginTop: 50
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    margin: 3
  },
  buttonImageDisplayScreenScanner:{
    alignItems: "center",
    flexDirection:"row",
    // flexDirection: 'row-reverse',
    backgroundColor: "#fddde6",
    padding: 10,
    margin: 18,
    width:250,
    borderRadius:10
  }, 
  buttonImageDisplayScreenDownload:{
    alignItems: "center",
    flexDirection:"row",
    backgroundColor: "#FFB6C1",
    padding: 10,
    margin: 18,
    width:220,
    borderRadius:10
  },
  iconsImageDisplay:
  {
    marginLeft:25,
  }
});


export default App


