import React, {Component} from 'react';
import {Button, Image, StyleSheet, Text, View, AsyncStorage} from 'react-native';
import {ImagePicker, Permissions} from 'expo';
import client from '../service/RequestClient';
import moment from 'moment-timezone'

export default class Uploader extends Component {
  state = {
    image: null,
    comment: '',
    uploaded: false
  };

  render() {
    const takePhotoText = this.state.image ? 'Sacar otra foto' : 'Sacar foto'
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

        {this._maybeRenderThanksMessage()
        }

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
          {this.state.uploaded && <Button title="Finalizar" onPress={() => this.props.onGoBack()}/>}
        </View>

      </View>
    )
  }

  _takePhoto = async () => {
    const {
      status: cameraPerm
    } = await Permissions.askAsync(Permissions.CAMERA);

    // only if user allows permission to camera
    if (cameraPerm !== 'granted') {
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

    this.setState({
      image
    });
  };

  async tryUploadImage() {
    const {image} = this.state
    if (!image) {
      Alert.alert('Error', 'No se selecciono imagen!')
      return
    }

    let uploadResponse;

    try {
      this.props.onUploadStart()
      uploadResponse = await uploadImageAsync(image)
      this.setState({uploaded: true})
    } catch (e) {
      console.log({uploadResponse});
      console.log({e});
      alert(`Error en la subida, por favor intente de nuevo. \n${JSON.stringify(e)}`);
    } finally {
      this.props.onUploadEnd()
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

/**
 * Return date as String in local timezone
 * @returns {string} date in format 'YYYY-MM-ddThh:MM:SS'
 */
function localISOTime() {
  return moment.tz('America/Argentina/Buenos_Aires').format().slice(0, -6)
}

async function uploadImageAsync(uri) {
  const resource = '/upload'
  const profileJSON = await AsyncStorage.getItem('userProfile')
  if (!profileJSON) {
    throw new Error('Perfil de usuario no disponible.')
  }
  const {username, firstName, lastName} = JSON.parse(profileJSON)
  const photoName = `[${localISOTime().replace('T', '] [')}] ${username} - ${firstName} ${lastName}`

  let uriParts = uri.split('.');
  let fileType = uriParts[uriParts.length - 1];

  let formData = new FormData();
  formData.append('photo', {
    uri,
    name: `${photoName}.${fileType}`,
    type: `image/${fileType}`
  });

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
