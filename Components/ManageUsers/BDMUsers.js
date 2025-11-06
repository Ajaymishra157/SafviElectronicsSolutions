import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert, StatusBar } from 'react-native'
import React, { useState } from 'react'
import MyButton from '../Commoncomponent/MyButton'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Subheader from '../Commoncomponent/Subheader'

const BDMUsers = ({ navigation }) => {
    const [userlist, setUserlist] = useState([]);
    const [mainloading, setMainloading] = useState(false);

    const openModal = (item, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedUser(item.user_name);
        setselecteduserid(item.userid);
        setSelecteduserdata(item);
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };

    const listusers = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.user_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setUserlist(result.Payload);
        } else {
            setUserlist([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listusers();
        }, [])
    );


    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            {/* <View>
                <StatusBar backgroundColor="#173161" barStyle="light-content" />
                <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack(null)}>
                        <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 0 }}>All Users</Text>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 18, marginLeft: 20 }}>..</Text>
                </View>
            </View> */}

            <Subheader headername="BDM Target" />

            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled' style={{ margin: 10 }}>
                    {userlist.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No BDM Target available</Text>
                    ) : (
                        userlist.map((item, index) => (
                            <TouchableOpacity onPress={() => navigation.navigate('BDMTargetlist', { selecteduserid: item.userid, username: item.user_name })} style={{ gap: 10, marginBottom: 10 }}>
                                <View style={{ borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Name: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.user_name}</Text>
                                        </View>

                                        {/* {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && ( */}
                                        {/* <TouchableOpacity onPress={(e) => {
                                            const { pageX, pageY } = e.nativeEvent;
                                            openModal(item, pageX, pageY);
                                        }}>
                                            <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                        </TouchableOpacity> */}
                                        {/* )} */}
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Role: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.user_type}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Contact: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.whatsapp_number}</Text>
                                    </View>

                                    {/* <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>BDM Target: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.achieve_bdm_target}</Text>
                                    </View> */}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
            {/* {hasCategoryPermissions.Add && (
                <View style={{ margin: 10 }}>
                    <MyButton btnname="Add User" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('AddUser')} />
                </View>
            )} */}

            {/* <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
                        {hasCategoryPermissions.Update && (
                            <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                            </TouchableOpacity>
                        )}
                        {hasCategoryPermissions.Delete && selecteduserid != userid && (
                            <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal> */}
        </View>
    )
}

export default BDMUsers