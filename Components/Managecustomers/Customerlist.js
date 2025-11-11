import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Linking, Alert, Modal, RefreshControl } from 'react-native'
import React, { useRef, useState } from 'react'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Feather from 'react-native-vector-icons/Feather'; // or MaterialIcons, FontAwesome, etc.

const Customerlist = ({ navigation }) => {
    const [customerlist, setCustomerList] = useState([]);
    const [allCustomers, setAllCustomers] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState(null);

    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });

    const [selecteduser, setSelectedUser] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [selecteduserid, setselecteduserid] = useState(null);
    const [selectedcustomer, setSelectedCustomer] = useState(null);
    const [usertype, setUsertype] = useState(null);

    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);

    // const listPermissions = async () => {
    //     setMainloading(true);
    //     const id = await AsyncStorage.getItem('admin_id');

    //     const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ user_id: id }),
    //     });
    //     const result = await response.json();
    //     if (result.code == "200") {
    //         setPermissionsList(result.payload);
    //         // Prepare permissions state
    //         let permissionsData = {};
    //         result.payload.forEach((item) => {
    //             const permsArray = item.menu_permission.split(',');
    //             let permsObject = {};
    //             permsArray.forEach((perm) => {
    //                 permsObject[perm] = true;
    //             });
    //             permissionsData[item.menu_name] = permsObject;
    //         });

    //         setPermissions(permissionsData);
    //     } else {
    //         console.log('Error fetching permissions');
    //     }
    //     setMainloading(false);
    // };

    // useFocusEffect(
    //     React.useCallback(() => {
    //         listPermissions();
    //     }, [])
    // );

    const hasCategoryPermissions = permissions['Customers'] || {};
    const hasPermissions = permissions['Distributor'] || {};

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

    const listcustomers = async (text = searchTerm) => {
        // Use the passed text parameter, fallback to searchTerm if no text provided
        const searchText = text !== undefined ? text : searchTerm;
        // const searchText = text ?? searchTerm ?? "";



        setLoading(true);

        // Update search term state
        setSearchTerm(searchText);


        const url = `${Constant.URL}${Constant.OtherURL.customer_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                search: searchText,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setAllCustomers(result.Payload); // Save the original list
            setCustomerList(result.Payload);
        } else {
            setAllCustomers([]);
            setCustomerList([]);
            console.log('error while listing category');
        }
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listcustomers();
            fetchusertype();
        }, [])
    );

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.customer_delete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                c_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listcustomers();
        } else {
            setProductList([]);
            // Handle error if needed
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Customer",
            `Are you sure you want to delete ${customerName} Customer?`,
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
        setSelectedUser(item.company_name);
        setCustomerName(item.full_name);
        setselecteduserid(item.c_id);
        setSelectedCustomer(item);
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };

    const handleEdit = () => {
        if (selectedcustomer) {
            navigation.navigate('AddCustomer', { customerdata: selectedcustomer });
            setModalvisible(false);
        }
    };

    const handleaddcustomer = () => {
        if (selectedcustomer) {
            navigation.navigate('AddCustomer', { customerdata: selectedcustomer, customer: 'Customer' });
            setModalvisible(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setSearchTerm(null);
        listcustomers().then(() => setRefreshing(false));
    }, []);


    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
                </TouchableOpacity>
                <Text style={{ color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 0 }}>All Customers</Text>
                <TouchableOpacity style={{ padding: 10, paddingLeft: 20 }}>
                    {/* <Image source={require('../../assets/filter.png')} style={{ height: 15, width: 15, tintColor: '#fff' }} /> */}
                </TouchableOpacity>
            </View>

            <View style={{ margin: 10 }}>
                <TextInput placeholder='Search by Customer name or mobile' value={searchTerm}
                    onChangeText={listcustomers} placeholderTextColor='gray' style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 10 }} />
            </View>

            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled' style={{ margin: 10 }} refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                    {loading ? (
                        <View style={{ alignItems: 'center', marginTop: 10 }}>
                            <ActivityIndicator size="large" color="#173161" />
                        </View>
                    ) :
                        customerlist.length == 0 ? (
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
                                    No Customers available
                                </Text>
                            </View>
                        ) : (
                            customerlist.map((item, index) => (
                                <TouchableOpacity disabled={true} key={index} style={{ gap: 10, marginBottom: 10 }}>
                                    <View style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <TouchableOpacity
                                                // onPress={() => navigation.navigate('CustomerwiseOrders', { companyname: item.company_name, area: item.area, customerid: item.c_id })}
                                                style={{ width: '50%' }}
                                                activeOpacity={1}>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.full_name}{item.area ? ` (${item.area})` : ''}</Text>
                                            </TouchableOpacity>
                                            <View style={{ flexDirection: 'row' }}>
                                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.moblie_no}`)} style={{ padding: 8 }}>
                                                    <Image source={require('../../assets/phone-call.png')} style={{ height: 18, width: 18, tintColor: '#000' }} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() =>
                                                    Linking.openURL(
                                                        `whatsapp://send?phone=${encodeURIComponent(`+91${item.moblie_no}`)}`
                                                    )} style={{ padding: 8 }}>
                                                    <Image source={require('../../assets/whatsapp.png')} style={{ height: 20, width: 23 }} />
                                                </TouchableOpacity>
                                                {/* {usertype == 'Admin' &&
                                                    <TouchableOpacity onPress={() => navigation.navigate('ProductPrice', { companyname: item.company_name, mobile: item.moblie_no, area: item.area, customerid: item.c_id })} style={{ padding: 8 }}>
                                                        <Image source={require('../../assets/skip-track.png')} style={{ height: 18, width: 18, tintColor: '#000' }} />
                                                    </TouchableOpacity>
                                                } */}

                                                {/* {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) && ( */}
                                                <TouchableOpacity onPress={(e) => {
                                                    const { pageX, pageY } = e.nativeEvent;
                                                    openModal(item, pageX, pageY);
                                                }} style={{ padding: 8 }}>
                                                    <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                                </TouchableOpacity>
                                                {/* )} */}
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                </ScrollView>
            </View>
            {/* {hasCategoryPermissions.Add && ( */}
            <View style={{ margin: 10 }}>
                <MyButton btnname="Add New Customer" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('AddCustomer')} />
            </View>
            {/* )} */}

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
                        {/* {hasCategoryPermissions.Update && ( */}
                        <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        {/* )} */}
                        {/* {hasCategoryPermissions.Delete && ( */}
                        <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                        </TouchableOpacity>
                        {/* )} */}

                        {/* {(hasPermissions.Add || hasPermissions.Update || hasPermissions.Delete) && */}
                        {/* <TouchableOpacity onPress={() => { setModalvisible(false); navigation.navigate('DistributedCustomer', { customerdata: selectedcustomer }) }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/distributor.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Distributor</Text>
                        </TouchableOpacity> */}
                        {/* } */}

                        {/* <TouchableOpacity onPress={handleaddcustomer} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Feather name="plus" size={20} color="#173161" />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Customer</Text>
                        </TouchableOpacity> */}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default Customerlist