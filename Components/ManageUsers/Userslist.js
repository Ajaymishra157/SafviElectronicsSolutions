import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert, StatusBar } from 'react-native'
import React, { useState } from 'react'
import MyButton from '../Commoncomponent/MyButton'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Subheader from '../Commoncomponent/Subheader'

const Userslist = ({ navigation }) => {
    const [userlist, setUserlist] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selecteduser, setSelectedUser] = useState(null);
    const [selecteduserid, setselecteduserid] = useState(null);
    const [selecteduserdata, setSelecteduserdata] = useState(null);
    const [userid, setUserId] = useState(null);
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    const listPermissions = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        setUserId(id);
        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setPermissionsList(result.payload);
            let permissionsData = {};
            result.payload.forEach((item) => {
                const permsArray = item.menu_permission.split(',');
                let permsObject = {};
                permsArray.forEach((perm) => {
                    permsObject[perm] = true;
                });
                permissionsData[item.menu_name] = permsObject;
            });

            setPermissions(permissionsData);
        } else {
            console.log('Error fetching permissions');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
        }, [])
    );
    const hasCategoryPermissions = permissions['Users'] || {};

    const listusers = async () => {
        setLoading(true);
        try {
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
        } catch (error) {
            console.log('Network error in listusers:', error);
            setUserlist([]);
        } finally {
            setLoading(false); // This will always run
        }
    };
    useFocusEffect(
        React.useCallback(() => {
            listusers();
        }, [])
    );

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.user_delete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listusers();
        } else {
            setUserlist([]);
            // Handle error if needed
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Staff",
            `Are you sure you want to delete ${selecteduser} Staff?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selecteduserid)
                }
            ]
        );
    };

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

    const handleEdit = () => {
        if (selecteduserdata) {
            navigation.navigate('AddUser', { userdata: selecteduserdata });
            setModalvisible(false);
        }
    };

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

            <Subheader headername="All Staffs" />

            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled' style={{ margin: 10 }}>
                    {loading ? (
                        // Show loader while loading
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
                            <ActivityIndicator size="large" color="#173161" />
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', marginTop: 10 }}>
                                Loading staff...
                            </Text>
                        </View>
                    ) : userlist.length == 0 ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
                            <Image
                                source={require('../../assets/group.png')} // 👈 path to your image
                                style={{ width: 120, height: 120, resizeMode: 'contain', marginBottom: 15 }}
                            />
                            <Text
                                style={{
                                    fontFamily: 'Inter-Bold',
                                    fontSize: 14,
                                    color: '#173161',
                                }}
                            >
                                No Staffs available
                            </Text>
                        </View>
                    ) : (
                        userlist.map((item, index) => (
                            <View key={index} style={{ gap: 10, marginBottom: 10 }}>
                                <View style={{ borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Name: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.user_name}</Text>
                                        </View>

                                        {/* {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && ( */}
                                        <TouchableOpacity onPress={(e) => {
                                            const { pageX, pageY } = e.nativeEvent;
                                            openModal(item, pageX, pageY);
                                        }}>
                                            <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                        </TouchableOpacity>
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
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            {/* {hasCategoryPermissions.Add && ( */}
            <View style={{ margin: 10 }}>
                <MyButton btnname="Add Staff" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('AddUser')} />
            </View>
            {/* )} */}

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
                    {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
                        {/* {hasCategoryPermissions.Update && ( */}
                        <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        {/* )} */}
                        {selecteduserid != userid && (
                            <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default Userslist