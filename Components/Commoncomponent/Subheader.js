import { View, Text, TouchableOpacity, Image, StatusBar, Alert } from 'react-native'
import React, { useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constant from './Constant';

const Subheader = ({ headername }) => {
    const navigation = useNavigation();

    const [userstatus, setUserstatus] = useState(null);

    const listPermissions = React.useCallback(async () => {
        try {
            const id = await AsyncStorage.getItem('admin_id');
            const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: id }),
            });

            const result = await response.json();
            if (result.code == "200") {
                setUserstatus(result.status);
                if (result.status == "deactive") {
                    Alert.alert("Access Denied", "Your account has been deactivated.");
                    await AsyncStorage.clear(); // Clear stored user data
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "LoginUser" }]
                    }); // Redirect to login
                }
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
        }, [listPermissions])
    );
    return (
        <View>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />
            <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
                </TouchableOpacity>
                <Text numberOfLines={1} style={{ color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 0, width: '80%', textAlign: 'center' }}>{headername}</Text>
                <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 18, marginLeft: 20 }}>..</Text>
            </View>
        </View>
    )
}

export default Subheader