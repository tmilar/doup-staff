import React, {Component} from 'react';
import {ActivityIndicator, Dimensions, StyleSheet, View} from 'react-native';
import {Constants} from 'expo';

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
    padding: 15,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingTop: 50,
    marginTop: Constants.statusBarHeight
  },
  maybeRenderUploading: {
    zIndex: 9999,
    // alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
});
