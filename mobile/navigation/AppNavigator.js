import React from 'react';
import {Image} from 'react-native';
import {createAppContainer, createStackNavigator, createSwitchNavigator} from 'react-navigation';

import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import UploadScreen from '../screens/UploadScreen';
import {Icon} from 'expo';
import {AsyncStorage} from 'react-native';

const AuthStack = createStackNavigator({
  Login: LoginScreen
});

async function _signOutAsync(navigation) {
  await AsyncStorage.clear();
  navigation.navigate('Auth');
}

const AppStack = createStackNavigator({
  Home: HomeScreen,
  Upload: UploadScreen
}, {
  defaultNavigationOptions: ({navigation}) => ({
    headerStyle: {
      backgroundColor: '#30282a'
    },
    headerTintColor: '#fff',
    headerTitle: <Image
      resizeMode="contain"
      source={require('../assets/images/logo-doup_green.png')}
      style={{width: 90, left: 10}}
    />,
    headerRight: <Icon.Octicons
      name="sign-out"
      color="#fff"
      size={32}
      onPress={() => _signOutAsync(navigation)}
    />
  })
});

export default createAppContainer(createSwitchNavigator({
    // authentication
    AuthLoading: AuthLoadingScreen,
    Auth: AuthStack,

    // app navigation
    App: AppStack
  },
  {
    initialRouteName: 'AuthLoading'
  }
));
