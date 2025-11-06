import { View, Text, TextInput, Image, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import MyButton from './Commoncomponent/MyButton';
import Constant from './Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';

const LoginUser = ({ navigation }) => {
    const [mobileno, setMobileno] = useState(null);
    const [password, setPassword] = useState(null);
    const [showpassword, setShowPassword] = useState(false);

    const [error, setError] = useState(null);
    const [mobileerror, setMobileerror] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleValidation = () => {
        if (!mobileno) {
            setMobileerror('Please enter your mobile number');
        } else if (mobileno.length != 10) {
            setMobileerror('Mobile number must be 10 digits');
        } else {
            setMobileerror('');
        }

        if (!password) {
            setPasswordError('Please enter your password');
        }
        else {
            setPasswordError('');
        }
    };

    const handleLogin = async () => {
        handleValidation();
        if (mobileno && password) {
            setLoading(true);

            const fcmToken = await messaging().getToken();
            // Device Details
            const phoneModel = DeviceInfo.getModel();
            const phoneOS = `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`;
            const appVersion = DeviceInfo.getVersion();

            const url = `${Constant.URL}${Constant.OtherURL.login}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: mobileno,
                    password: password,
                    phone_model: phoneModel,
                    phone_os: phoneOS,
                    app_version: appVersion,
                    // fcm_token: fcmToken
                }),
            });

            const result = await response.json();
            if (result.code == "200") {
                await AsyncStorage.setItem('admin_id', result.payload.admin_id.toString());
                await AsyncStorage.setItem('user_type', result.payload.user_type);
                await AsyncStorage.setItem('user_name', result.payload.user_name);

                navigation.reset({
                    index: 0,
                    routes: [{ name: "Dashboard" }]
                });

            } else {
                setError(result.message);
            }
            setLoading(false);
        }
    };
    const isLoginDisabled = !(mobileno && mobileno.length === 10 && password);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Image source={require('../assets/ic_launcher.png')} style={{ height: 150, width: 150 }} />
            </View>
            <View style={{ marginHorizontal: 20 }}>
                <Text style={{ textAlign: 'center', fontSize: 20, fontFamily: 'Inter-Light', color: 'gray', marginBottom: 20, paddingLeft: 5 }}>
                    Login to continue
                </Text>

                <View style={{ marginBottom: 20, }}>
                    <TextInput style={{ fontFamily: 'Inter-Regular', height: 50, borderColor: '#000', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, fontSize: 14, backgroundColor: 'white', color: '#000' }} keyboardType='numeric' maxLength={10} placeholder="Enter Contact Number" placeholderTextColor="gray" onChangeText={setMobileno} />
                    {mobileerror ? <Text style={{ color: 'red', marginLeft: 0, marginTop: 10, fontFamily: 'Inter-Regular' }}>{mobileerror}</Text> : ''}
                </View>

                <View style={{ backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, borderColor: '#000', borderWidth: 1, borderRadius: 8, }}>
                    <TextInput style={{ fontFamily: 'Inter-Regular', width: "80%", fontSize: 14, backgroundColor: 'white', color: '#000' }} placeholder="Password" placeholderTextColor="gray" secureTextEntry={!showpassword} onChangeText={setPassword} />
                    <View style={{ alignItems: "center", justifyContent: "center", }}>
                        <TouchableOpacity onPress={() => setShowPassword(!showpassword)} style={{ paddingLeft: 20, paddingVertical: 10 }}>
                            {!showpassword ? (
                                <Image source={require('../assets/eyeclose.png')} style={{ height: 20, width: 20 }} />
                            ) : (
                                <Image source={require('../assets/eyeopen.png')} style={{ height: 20, width: 20 }} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                {passwordError ? <Text style={{ color: 'red', marginLeft: 0, marginTop: 10, fontFamily: 'Inter-Regular' }}>{passwordError}</Text> : ''}

                <View style={{ marginTop: 10 }}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#173161" />
                    ) : (
                        <TouchableOpacity disabled={isLoginDisabled}
                            onPress={handleLogin}
                            style={{ width: '100%', backgroundColor: isLoginDisabled ? '#C5C6D0' : '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                            <Text style={{ color: isLoginDisabled ? '#000' : '#FFF', fontSize: 18, fontFamily: 'Inter-Bold' }}>
                                Login
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                {error ? <Text style={{ color: 'red', marginLeft: 0, marginTop: 10, fontFamily: 'Inter-Regular' }}>{error}</Text> : ''}
            </View>
        </View>
    )
}

export default LoginUser