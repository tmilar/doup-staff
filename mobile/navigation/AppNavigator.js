import React from 'react';
import {AsyncStorage, Image} from 'react-native';
import {createAppContainer, createStackNavigator, createSwitchNavigator} from 'react-navigation';

import {Icon} from 'expo';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import UploadScreen from '../screens/UploadScreen';
import UpcomingLessonScreen from "../screens/UpcomingLessonScreen";
import PreviousTurnsReportScreen from "../screens/PreviousTurnsReportScreen";
import CurrentLessonScreen from "../screens/CurrentLessonScreen";

const AuthStack = createStackNavigator({
  Login: LoginScreen
});

async function _signOutAsync(navigation) {
  await AsyncStorage.clear();
  navigation.navigate('Auth');
}

const appDefaultNavigationOptions = ({navigation}) => ({
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
});

const CurrentLessonNavigation = createStackNavigator({
  CurrentLesson: CurrentLessonScreen,
  Upload: UploadScreen
}, {
  defaultNavigationOptions: appDefaultNavigationOptions
})

const UpcomingLessonNavigation = createStackNavigator({
  UpcomingLesson: UpcomingLessonScreen,
  PreviousTurnsReport: PreviousTurnsReportScreen,
}, {
  defaultNavigationOptions: appDefaultNavigationOptions
})


const AppNavigation = createSwitchNavigator({
  UpcomingLesson: UpcomingLessonNavigation,
  CurrentLesson: CurrentLessonNavigation
}, {
  defaultNavigationOptions: appDefaultNavigationOptions
});

export default createAppContainer(createSwitchNavigator({
    // authentication
    AuthLoading: AuthLoadingScreen,
    Auth: AuthStack,

    // app navigation
    App: AppNavigation
  },
  {
    initialRouteName: 'AuthLoading'
  }
));
