import { View, Text, ActivityIndicator, Alert, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constant from '../Commoncomponent/Constant';
import { CommonActions, useFocusEffect } from '@react-navigation/native';

const MyProfile = ({ navigation }) => {
    const [data, setData] = useState(null);
    const [mainloading, setMainloading] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    // const logoutfunction = async () => {
    //     Alert.alert(
    //         'Confirm Logout',
    //         'Are you sure you want to logout?',
    //         [
    //             {
    //                 text: 'Cancel',
    //                 onPress: () => console.log('Logout Cancelled'),
    //                 style: 'cancel',
    //             },
    //             {
    //                 text: 'Logout',
    //                 onPress: async () => {
    //                     await AsyncStorage.clear();
    //                     navigation.dispatch(
    //                         CommonActions.reset({
    //                             index: 0,
    //                             routes: [
    //                                 { name: 'LoginUser' },
    //                             ],
    //                         }),
    //                     );
    //                 },
    //             },
    //         ],
    //         { cancelable: false },
    //     );
    // };


    const logoutfunction = () => {
        setLogoutModalVisible(true);
    };

    const confirmLogout = async () => {
        setLogoutModalVisible(false);
        await AsyncStorage.clear();
        navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'LoginUser' }] })
        );
    };

    const mydata = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.myprofile}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setData(result.Payload[0]);
        } else {
            console.log('error while listing product');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            mydata();
        }, [])
    );

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    if (data) {
        return (
            <View style={{ flex: 1 }}>
                <Subheader headername='My Profile' />
                <View style={{ flex: 1, marginVertical: 10, marginHorizontal: 5 }}>
                    <View style={{ backgroundColor: '#fff', padding: 10, paddingLeft: 20, borderRadius: 5, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4, }}>
                        <View style={{ gap: 10 }}>
                            <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 16, textAlign: 'center' }}>Personal Details</Text>
                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 14, }}>Name</Text>
                                <Text style={{ fontFamily: 'Inter-Medium', color: '#173161', fontSize: 14, }}>{data.user_name || '---'} {data.last_name || '---'}</Text>
                            </View>

                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 14, }}>Role</Text>
                                <Text style={{ fontFamily: 'Inter-Medium', color: '#173161', fontSize: 14, }}>{data.user_type || '---'}</Text>
                            </View>

                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 14, }}>Address</Text>
                                <Text style={{ fontFamily: 'Inter-Medium', color: '#173161', fontSize: 14, }}>{data.address || '---'}</Text>
                            </View>

                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 14, }}>Phone number</Text>
                                <Text style={{ fontFamily: 'Inter-Medium', color: '#173161', fontSize: 14, }}>{data.whatsapp_number || '---'}</Text>
                            </View>


                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 14, }}>Phone Model</Text>
                                <Text style={{ fontFamily: 'Inter-Medium', color: '#173161', fontSize: 14, }}>{data.phone_model || '---'}</Text>
                            </View>

                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 14, }}>Phone OS</Text>
                                <Text style={{ fontFamily: 'Inter-Medium', color: '#173161', fontSize: 14, }}>{data.phone_os || '---'}</Text>
                            </View>

                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 14, }}>App Version</Text>
                                <Text style={{ fontFamily: 'Inter-Medium', color: '#173161', fontSize: 14, }}>{data.app_version || '---'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: 10, backgroundColor: '#fff', padding: 5, paddingLeft: 0, borderRadius: 10, alignItems: 'center', shadowOpacity: 0.2, shadowRadius: 3, elevation: 4, width: '40%' }}>
                        <TouchableOpacity onPress={logoutfunction} style={{ padding: 10, flexDirection: 'row', gap: 10 }}>
                            <Image source={require('../../assets/log-out.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', fontSize: 14, }}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Logout Confirmation Modal */}
                {/* Logout Confirmation Modal */}
                <Modal
                    visible={logoutModalVisible}
                    transparent
                    animationType="fade"
                    onDismiss={() => setLogoutModalVisible(false)}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 12,
                                padding: 20,
                                width: '80%',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={require('../../assets/log-out.png')}
                                style={{
                                    height: 50,
                                    width: 50,
                                    tintColor: '#173161',
                                    marginBottom: 10,
                                }}
                            />

                            <Text
                                style={{
                                    fontFamily: 'Inter-Bold',
                                    fontSize: 18,
                                    color: '#173161',
                                    marginBottom: 8,
                                }}
                            >
                                Confirm Logout
                            </Text>

                            <Text
                                style={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 14,
                                    color: '#555',
                                    textAlign: 'center',
                                    marginBottom: 20,
                                }}
                            >
                                Are you sure you want to logout?
                            </Text>

                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => setLogoutModalVisible(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#ccc',
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        marginRight: 5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            color: '#173161',
                                            fontFamily: 'Inter-SemiBold',
                                        }}
                                    >
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={confirmLogout}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#173161',
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        marginLeft: 5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            color: '#fff',
                                            fontFamily: 'Inter-SemiBold',
                                        }}
                                    >
                                        Logout
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </View >


        )
    }
}

export default MyProfile