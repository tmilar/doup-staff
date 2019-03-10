import React, {Component} from 'react';
import {ActivityIndicator, Dimensions, StyleSheet, View} from 'react-native';

import Uploader from '../components/Uploader';

export default class UploadScreen extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    }
  }

  _maybeRenderUploadingOverlay = () => {
    if (this.state.loading) {
      return (
        <View
          style={[StyleSheet.absoluteFill, styles.maybeRenderUploading]}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      );
    }
  };

  toggleLoading = () => {
    this.setState((prevState) => ({loading: !prevState.loading}))
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, zIndex: 0}}>
          <Uploader onUploadStart={() => this.toggleLoading()} onUploadEnd={() => this.toggleLoading()}/>
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
    justifyContent: 'center',
  },
});