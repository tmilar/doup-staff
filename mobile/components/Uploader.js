import React, {Component} from 'react';
import {Button, Image, StyleSheet, Text, View, AsyncStorage, Alert, Platform} from 'react-native';
import {ImagePicker, Permissions, Linking, IntentLauncherAndroid as IntentLauncher} from 'expo';
import client from '../service/RequestClient';
import moment from 'moment-timezone'

export default class Uploader extends Component {
  state = {
    image: null,
    comment: '',
    uploaded: false
  };

  render() {
    const takePhotoText = this.state.image ? 'Cambiar foto' : 'Sacar foto'
    return (
      <View
        style={this.state.image ? [styles.container, {justifyContent: 'flex-start', marginTop: 30}] : styles.container}>

        <Button onPress={this._takePhoto} title={takePhotoText}/>
        {this._maybeRenderImage()}
        {this._maybeRenderImageActionButtons()}
      </View>
    );
  }

  _maybeRenderImage = () => {
    const {image} = this.state;

    if (!image) {
      return;
    }

    return (
      <View style={styles.imageViewContainer}>
        <View style={styles.imageContainer}>
          <Image source={{uri: image}} style={styles.maybeRenderImage}/>
        </View>

        {this._maybeRenderThanksMessage()}
      </View>
    );
  };

  _maybeRenderImageActionButtons = () => {
    const {image, uploaded} = this.state
    if (!image) {
      return
    }
    return (
      <View style={{height: 40, width: '80%', marginTop: 20}}>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-evenly'}}>
          {!uploaded && <Button title="Subir" onPress={this.tryUploadImage}/>}
          {uploaded && <Button title="Listo" onPress={this.props.onFinish}/>}
        </View>
      </View>
    )
  }

  _takePhoto = async () => {
    const {status: cameraPerm} = await Permissions.askAsync(Permissions.CAMERA);
    const {status: cameraRollPerm} = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    // only if user allows permission to camera AND camera roll
    if (cameraPerm !== 'granted' || cameraRollPerm !== 'granted') {
      await new Promise(resolve => {
        Alert.alert(
          "¡Ups!",
          'Es necesario autorizar la cámara y la galería para que la app pueda tomar y subir fotos.',
          [{
            text: 'OK',
            onPress: resolve
          }]
        )
      })

      // If rejected, user must give permissions manually.
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:')
      } else {
        await IntentLauncher.startActivityAsync(IntentLauncher.ACTION_APPLICATION_SETTINGS);
      }
      return
    }

    await new Promise(resolve => this.setState({uploaded: false}, resolve))

    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      exif: true
    });

    return this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async ({uri: image, cancelled}) => {
    if (cancelled) {
      console.log("[Uploader] Cancelled image pick.")
      return
    }

    this.setState({image});
  };

  _buildPictureName = async () => {
    const profile = JSON.parse(await AsyncStorage.getItem('userProfile') || null)
    if (!profile) {
      throw new Error('Perfil de usuario no disponible.')
    }

    const uploadTimeStr = moment().format('[[]YYYY-MM-DD[]] [[]HH:mm:ss[]]')
    const {username, firstName, lastName} = profile
    const {discipline, site, startDate, endDate} = this.props.lesson
    const startTime = moment(startDate).format('HH:mm')
    const endTime = moment(endDate).format('HH:mm')

    return `${uploadTimeStr} - ${discipline}, '${site}' (${startTime} - ${endTime}) - ${username} (${firstName} ${lastName})`
  }

  tryUploadImage = async () => {
    const {image} = this.state
    if (!image) {
      Alert.alert('Error', 'No se seleccionó una imagen!')
      return
    }

    const uploadName = await this._buildPictureName()

    let uploadResponse;

    try {
      this.props.onUploadStart()
      uploadResponse = await uploadImageAsync(image, uploadName)
      await new Promise(resolve =>
        this.setState({uploaded: true}, resolve)
      )
      await this.props.onUploadEnd()
    } catch (error) {
      console.log({uploadResponse});
      console.log({e: error});
      Alert.alert(`Error`,`No se pudo subir su imagen, por favor intente nuevamente. \n${JSON.stringify(error)}`);
      await this.props.onUploadEnd(error)
    }
  }

  _maybeRenderThanksMessage = () => {
    if (!this.state.uploaded) {
      return
    }

    return (
      <Text style={styles.imageThanksText}>
        {'¡Gracias por tu aporte!'}
      </Text>
    )
  }
}

async function uploadImageAsync(uri, pictureTitle) {
  const resource = '/upload'

  let uriParts = uri.split('.');
  let fileType = uriParts[uriParts.length - 1];
  let name = `${pictureTitle}.${fileType}`

  let formData = new FormData();
  formData.append('photo', {
    uri,
    name,
    type: `image/${fileType}`
  });

  console.log(`Uploading... ${name}`)

  return client.postMultipartFormData(resource, {
    body: formData
  })
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  imageViewContainer: {
    borderRadius: 3,
    elevation: 2,
    marginTop: 30,
    shadowColor: 'rgba(0,0,0,1)',
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 4,
      width: 4
    },
    shadowRadius: 5,
    width: 300
  },
  imageContainer: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#e1e4e8'
  },
  maybeRenderImage: {
    height: 300,
    width: 300
  },
  imageThanksText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
});
