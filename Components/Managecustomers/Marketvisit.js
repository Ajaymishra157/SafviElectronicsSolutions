import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert, RefreshControl, TextInput } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Marketvisit = ({ navigation }) => {
    const [marketvisitlist, setMarketvisitlist] = useState([]);
    const [listvisit, setlistvisit] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selecteduser, setSelectedUser] = useState(null);
    const [selecteduserid, setselecteduserid] = useState(null);
    const [searchTerm, setSearchTerm] = useState(null);
    const [selectedcustomer, setSelectedcustomer] = useState(null);
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [usertype, setUsertype] = useState(null);

    const listPermissions = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setPermissionsList(result.payload);
            // Prepare permissions state
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

    const hasCategoryPermissions = permissions['Market Visit'] || {};

    const fetchusertype = async () => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.fetch_usertype}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setUsertype(result.payload.user_type)
        } else {
            console.log('Error fetching permissions');
        }
        setLoading(false);
    };

    const listvisits = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.marketvisit_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: usertype == 'Admin' ? '' : id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setMarketvisitlist(result.Payload);
            setlistvisit(result.Payload);
        } else {
            setMarketvisitlist([]);
            setlistvisit([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listvisits();
            fetchusertype();
        }, [usertype])
    );

    useFocusEffect(
        React.useCallback(() => {
            fetchusertype();
        }, [])
    );

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.marketvisit_delete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listvisits();
        } else {
            setMarketvisitlist([]);
            // Handle error if needed
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Lead",
            `Are you sure you want to delete ${selecteduser}'s Survey?`,
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
        setSelectedUser(item.name);
        setselecteduserid(item.id);
        setSelectedcustomer(item)
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        listvisits().then(() => setRefreshing(false));
    }, []);

    const handleSearch = async (text) => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        setSearchTerm(text);
        const url = `${Constant.URL}${Constant.OtherURL.marketvisit_search}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                search: searchTerm,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setMarketvisitlist(result.payload);
        } else {
            setMarketvisitlist([]);
            console.log('error while listing product');
        } setLoading(false);
    };

    const handleEdit = () => {
        if (selectedcustomer) {
            navigation.navigate('AddMarketVisit', { customerdata: selectedcustomer });
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
            <Subheader headername='All Market Visits' />

            <View style={{ margin: 10 }}>
                <TextInput placeholder='Search by company/firm name or contact' value={searchTerm}
                    onChangeText={handleSearch} placeholderTextColor='gray' style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 10 }} />
            </View>
            <ScrollView keyboardShouldPersistTaps='handled' style={{ margin: 10 }} contentContainerStyle={{ paddingBottom: 60 }} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                {
                    loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' }} >
                            <ActivityIndicator size="large" color="#173161" />
                        </View>
                    ) : marketvisitlist.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Customers available</Text>
                    ) : (
                        marketvisitlist.map((item, index) => (
                            <TouchableOpacity onPress={() => navigation.navigate('AddSizes', { customerid: item.id })} key={index} style={{ gap: 10, marginBottom: 10 }}>
                                <View style={{ borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', width: '60%' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Customer Name: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.name}</Text>
                                        </View>
                                        {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && (
                                            <TouchableOpacity onPress={(e) => {
                                                const { pageX, pageY } = e.nativeEvent;
                                                openModal(item, pageX, pageY);
                                            }}>
                                                <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Firm Name: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.firm}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Contact: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.mobile_no}</Text>
                                    </View>
                                </View>

                            </TouchableOpacity>
                        ))
                    )
                }
            </ScrollView >
            {hasCategoryPermissions.Add && (
                <View style={{ margin: 10 }}>
                    <MyButton btnname="Add Customer" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.replace('AddMarketVisit')} />
                </View>
            )}

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
                    {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
                    <View
                        onStartShouldSetResponder={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: modalPosition.top,
                            left: modalPosition.left,
                            gap: 10,
                            backgroundColor: '#fff',
                            paddingHorizontal: 20,
                            paddingBottom: 20,
                            paddingTop: 10,
                            borderRadius: 10,
                        }}
                    >
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
        </View >
    )
}

export default Marketvisit