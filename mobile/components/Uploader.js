import React, {Component} from 'react';
import {Button, Image, StatusBar, StyleSheet, Text, View} from 'react-native';
import {ImagePicker, Permissions} from 'expo';
import client from '../service/RequestClient';

export default class Uploader extends Component {
  state = {
    image: null
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="default" />

        <Button onPress={this._takePhoto} title="Subir foto" />

        {this._maybeRenderImage()}
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

        <Text
          style={styles.maybeRenderImageText}>
          {'¡Gracias por tu aporte!'}
        </Text>
      </View>
    );
  };

  _takePhoto = async () => {
    const {
      status: cameraPerm
    } = await Permissions.askAsync(Permissions.CAMERA);

    // only if user allows permission to camera
    if (cameraPerm === 'granted') {
      let pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
        exif: true
      });

      return this._handleImagePicked(pickerResult);
    }
  };

  _handleImagePicked = async ({uri: image, cancelled}) => {
    if (cancelled) {
      return
    }

    await this.tryUploadImage(image)

    this.setState({
      image
    });
  };

  async tryUploadImage(image) {

    if (!image) {
      Alert.alert('Error', 'No se selecciono imagen!')
      return
    }

    let uploadResponse;

    try {
      this.props.onUploadStart()
      uploadResponse = await uploadImageAsync(image)
    } catch (e) {
      console.log({uploadResponse});
      console.log({e});
      alert(`Error en la subida, por favor intente de nuevo. \n${JSON.stringify(e)}`);
    } finally {
      this.props.onUploadEnd()
    }
  }
}

async function uploadImageAsync(uri) {
  const resource = '/upload'

  let uriParts = uri.split('.');
  let fileType = uriParts[uriParts.length - 1];

  let formData = new FormData();
  formData.append('photo', {
    uri,
    name: `photo.${fileType}`,
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
      width: 4,
    },
    shadowRadius: 5,
    width: 250,
  },
  maybeRenderImageContainer: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },
  maybeRenderImage: {
    height: 250,
    width: 250,
  },
  maybeRenderImageText: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: 'center',
    textAlignVertical: 'center'
  }
});
