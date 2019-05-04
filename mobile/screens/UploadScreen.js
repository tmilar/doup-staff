import React, {Component} from 'react';
import {ActivityIndicator, Dimensions, StyleSheet, View} from 'react-native';

import Uploader from '../components/Uploader';
import {showToast} from "react-native-notifyer";

export default class UploadScreen extends Component {

  state = {
    loading: false
  }

  _maybeRenderUploadingOverlay = () => {
    if (this.state.loading) {
      return (
        <View
          style={[StyleSheet.absoluteFill, styles.maybeRenderUploading]}>
          <ActivityIndicator color="#fff" size="large"/>
        </View>
      );
    }
  };

  toggleLoading = () => {
    this.setState((prevState) => ({loading: !prevState.loading}))
  }

  onUploadStart = () => {
    this.toggleLoading()
  }

  onUploadEnd = error => {
    this.toggleLoading()
    if (error) {
      showToast("Error en la subida")
      return
    }
    showToast("Subida exitosa")
  }

  onFinish = async () => {
    console.log("[UploadScreen] Finished uploading. ")
    const onFinish = this.props.navigation.getParam('onFinish',
      () => console.log("[UploadScreen] DEFAULT - Upload pics finished.")
    )
    return onFinish()
  }

  render() {
    const currentLesson = this.props.navigation.getParam('lesson')
    return (
      <View style={styles.container}>
        <View style={{flex: 1, zIndex: 0}}>
          <Uploader lesson={currentLesson}
                    onUploadStart={this.onUploadStart}
                    onUploadEnd={this.onUploadEnd}
                    onFinish={this.onFinish}
                    onGoBack={this.props.navigation.goBack}
          />
        </View>
        {this._maybeRenderUploadingOverlay()}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height,
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  maybeRenderUploading: {
    zIndex: 9999,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center'
  }
});
