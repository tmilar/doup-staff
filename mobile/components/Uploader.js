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
      <View style={styles.maybeRenderContainer}>
        <View style={styles.maybeRenderImageContainer}>
          <Image source={{uri: image}} style={styles.maybeRenderImage}/>
        </View>

        {this._maybeRenderThanksMessage()}
      </View>
    );
  };

  _maybeRenderImageActionButtons = () => {
    const {image} = this.state
    if (!image) {
      return
    }
    return (
      <View style={{height: 40, width: '80%', marginTop: 20}}>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-evenly'}}>
          {!this.state.uploaded && <Button title="Subir" onPress={() => this.tryUploadImage()}/>}
          {this.state.uploaded && <Button title="Listo" onPress={() => this.props.onGoBack()}/>}
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
          'Es necesario autorizar a la app para tomar fotos.',
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

    this.setState({uploaded: false})

    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      exif: true
    });

    return this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async ({uri: image, cancelled}) => {
    if (cancelled) {
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
      this.setState({uploaded: true})
    } catch (e) {
      console.log({uploadResponse});
      console.log({e});
      Alert.alert(`Error`,`No se pudo subir su imagen, por favor intente nuevamente. \n${JSON.stringify(e)}`);
    } finally {
      await this.props.onUploadEnd()
    }
  }

  _maybeRenderThanksMessage = () => {
    if (!this.state.uploaded) {
      return
    }

    return (
      <Text style={styles.maybeRenderImageText}>
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
  maybeRenderContainer: {
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
  maybeRenderImageContainer: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden'
  },
  maybeRenderImage: {
    height: 300,
    width: 300
  },
  maybeRenderImageText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
});
