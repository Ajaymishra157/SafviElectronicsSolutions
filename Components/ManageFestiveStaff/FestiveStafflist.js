import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert, StatusBar, FlatList } from 'react-native'
import React, { useState } from 'react'
import MyButton from '../Commoncomponent/MyButton'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Subheader from '../Commoncomponent/Subheader'
import FastImage from 'react-native-fast-image'

const FestiveStafflist = ({ navigation }) => {
    const [stafflist, setStafflist] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedstaff, setSelectedStaff] = useState(null);
    const [selectedstaffid, setselectedstaffid] = useState(null);
    const [selectedstaffdata, setSelectedstaffdata] = useState(null);
    const [staffid, setStaffId] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const listPermissions = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        setStaffId(id);
        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
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
    const hasCategoryPermissions = permissions['Staff'] || {};

    const liststaffs = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list_staff}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: ''
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setStafflist(result.payload);
        } else {
            setStafflist([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            liststaffs();
        }, [])
    );

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.delete_staff}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                staff_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            liststaffs();
        } else {
            setStafflist([]);
            // Handle error if needed
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Staff",
            `Are you sure you want to delete ${selectedstaff} Staff?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selectedstaffid)
                }
            ]
        );
    };

    const openModal = (item, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setSelectedStaff(item.staff_name);
        setselectedstaffid(item.staff_id);
        setSelectedstaffdata(item);
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };

    const handleEdit = () => {
        if (selectedstaffdata) {
            navigation.navigate('FestiveStaff', { staffdata: selectedstaffdata });
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
            <Subheader headername="All Staff" />

            <View style={{ flex: 1 }}>
                <FlatList
                    data={stafflist}
                    keyExtractor={(item, index) => item.staff_id?.toString() || index.toString()}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ margin: 10 }}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity activeOpacity={1} style={{ gap: 10, marginBottom: 10 }}>
                            <View
                                style={{
                                    borderRadius: 10,
                                    padding: 10,
                                    borderColor: 'gray',
                                    borderWidth: 0.3,
                                    backgroundColor: '#fff',
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {/* Image on the left */}
                                    <FastImage
                                        source={{ uri: item.staff_image }}
                                        style={{ height: 50, width: 50, borderRadius: 10, marginRight: 10 }}
                                        resizeMode={FastImage.resizeMode.cover}
                                        onError={(e) => console.log('Image Load Failed:', item.staff_name, e.nativeEvent.error)}
                                    />

                                    {/* Name and contact details */}
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Name: </Text>
                                            <Text
                                                style={{
                                                    fontFamily: 'Inter-Regular',
                                                    fontSize: 14,
                                                    color: '#173161',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {item.staff_name}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Contact: </Text>
                                            <Text
                                                style={{
                                                    fontFamily: 'Inter-Regular',
                                                    fontSize: 14,
                                                    color: '#173161',
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {item.staff_mobile}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Three dot icon on the right */}
                                    {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && (
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                const { pageX, pageY } = e.nativeEvent;
                                                openModal(item, pageX, pageY);
                                            }}
                                        >
                                            <Image
                                                source={require('../../assets/threedot.png')}
                                                style={{ height: 20, width: 20, tintColor: '#173161' }}
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text
                            style={{
                                fontFamily: 'Inter-Bold',
                                fontSize: 14,
                                color: '#173161',
                                alignSelf: 'center',
                                marginTop: 100,
                            }}
                        >
                            No Staff available
                        </Text>
                    }
                />
            </View>
            {hasCategoryPermissions.Add && (
                <View style={{ margin: 10 }}>
                    <MyButton btnname="Add Staff" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('FestiveStaff')} />
                </View>
            )}

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
                    {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
                        {hasCategoryPermissions.Update && (
                            <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                            </TouchableOpacity>
                        )}
                        {hasCategoryPermissions.Delete && (
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

export default FestiveStafflist