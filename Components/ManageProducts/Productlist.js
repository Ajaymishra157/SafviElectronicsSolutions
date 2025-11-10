import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import MyButton from '../Commoncomponent/MyButton'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Productlist = ({ navigation }) => {
    const [productlist, setProductList] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selecteduser, setSelectedUser] = useState(null);
    const [selecteduserid, setselecteduserid] = useState(null);
    const [selectedproduct, setSelectedproduct] = useState(null);
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

    const hasCategoryPermissions = permissions['Products'] || {};

    const listproduct = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.product_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({

            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setProductList(result.Payload);
        } else {
            setProductList([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listproduct();
        }, [])
    );

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.product_delete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            listproduct();
        } else {
            setProductList([]);
            // Handle error if needed
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Product",
            `Are you sure you want to delete ${selecteduser} Product?`,
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
        setSelectedUser(item.product_name);
        setselecteduserid(item.product_id);
        setSelectedproduct(item);
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };

    const handleEdit = () => {
        if (selectedproduct) {
            navigation.navigate('Addproduct', { productdata: selectedproduct });
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
            <Subheader headername='All Products' />

            <ScrollView keyboardShouldPersistTaps='handled' style={{ marginVertical: 10, marginHorizontal: 2 }}>
                {productlist.length === 0 ? (
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>
                        No Products available
                    </Text>
                ) : (
                    productlist.map((subcat, subIndex) => (
                        <View key={subIndex} style={{ marginBottom: 10, borderBottomWidth: 1, borderColor: '#173161', }}>
                            {/* Subcategory Title */}
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, textAlign: 'center', color: '#173161', marginBottom: 10 }}>
                                {subcat.subcategory_name.toUpperCase()}
                            </Text>

                            {/* Products under this subcategory */}
                            {subcat.products.map((item, index) => (
                                <View key={index} style={{ gap: 10, marginBottom: 10, marginHorizontal: 10, }}>
                                    <View style={{
                                        borderRadius: 10,
                                        padding: 10,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 3.84,
                                        elevation: 5,
                                        backgroundColor: '#fff',
                                    }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', width: '60%' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Product Name: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.product_name}</Text>
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
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Price: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.product_price}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Quantity: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.product_qty}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* {hasCategoryPermissions.Add && ( */}
            <View style={{ margin: 10 }}>
                <MyButton btnname="Add Product" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('Addproduct')} />
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
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default Productlist