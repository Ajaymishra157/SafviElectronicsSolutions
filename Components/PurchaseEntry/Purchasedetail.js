import { View, Text, ScrollView, StatusBar, TouchableOpacity, Image, Modal, ActivityIndicator, Alert } from 'react-native'
import React, { useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import Subheader from '../Commoncomponent/Subheader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Purchasedetail = ({ navigation, route }) => {
    const { purchaseno, partyname, billno, purchasedate, purchase_created_by, partyid } = route.params;
    const [purchasedetail, setpurchasedetail] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedenrty, setSelectedentry] = useState(null);

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

    const hasCategoryPermissions = permissions['Purchase Entry'] || {};

    const listpurchasedetail = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.purchase_detail}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                purchase_no: purchaseno
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setpurchasedetail(result.payload);
        } else {
            setpurchasedetail([]);
            console.log('error while listing purchase list');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listpurchasedetail();
            listPermissions();
        }, [])
    );

    const handleEdit = () => {
        setModalvisible(false);
        navigation.navigate('Addpurchaseentry', { bill_no: billno, partyid: partyid, purchase_no: purchaseno, purchasedate: purchasedate })
    };

    const formatOrderDate = (dateString) => {
        if (!dateString) return "00-00-0000"; // Default if no date is provided
        const date = new Date(dateString); // Convert to Date object
        const day = String(date.getDate()).padStart(2, '0'); // Get day and pad if needed
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based, add 1)
        const year = date.getFullYear(); // Get full year

        return `${day}/${month}/${year}`;
    };

    const openModal = (x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        // setselecteduserid(item.userid);
        // setSelecteduserdata(item);
        setModalvisible(true);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Order",
            `Are you sure you want to delete this Purchase?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete()
                }
            ]
        );
    };

    const handleDelete = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.purchase_delete}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                purchase_no: purchaseno,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setModalvisible(false);
            navigation.goBack(null);
        } else {
            // Handle error if needed
        }
        setMainloading(false);
    };

    const totalpcs = (purchasedetail.reduce((sum, item) => sum + parseFloat(item.pcs_qty || 0), 0));
    const formatFixed3 = (num) => {
        const [intPart, decPart = ''] = num.toString().split('.');
        const truncatedDecimal = decPart.substring(0, 3); // Take first 3 digits only
        const paddedDecimal = truncatedDecimal.padEnd(3, '0'); // Pad zeroes if needed
        return decPart ? `${intPart}.${paddedDecimal}` : intPart;
    };

    const totalkg = purchasedetail.reduce((sum, item) => sum + parseFloat(item.kg_qty || 0), 0);
    const truncatedKg = Math.floor(totalkg * 1000) / 1000;
    const formattedKg = formatFixed3(truncatedKg);

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <View>
                <StatusBar backgroundColor="#173161" barStyle="light-content" />
                <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 0 }}>Purchase Detaills</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {(hasCategoryPermissions.Update || hasCategoryPermissions.Delete) &&
                            <TouchableOpacity
                                style={{ justifyContent: 'center', paddingVertical: 10, paddingRight: 10, paddingLeft: 5 }}
                                onPress={(e) => {
                                    const { pageX, pageY } = e.nativeEvent;
                                    openModal(pageX, pageY);
                                }}
                            >
                                <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#fff' }} />
                            </TouchableOpacity>}
                    </View>
                </View>
            </View>

            <View style={{ flex: 1 }}>
                <ScrollView>
                    <View style={{ backgroundColor: '#e6f0ff', paddingVertical: 10, borderRadius: 5, marginBottom: 10, marginHorizontal: 2 }}>
                        <View style={{ paddingHorizontal: 5 }}>
                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                Party Name:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                    {partyname}
                                </Text>
                            </Text>

                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                Bill No:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                    {billno}
                                </Text>
                            </Text>

                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                Purchase Date:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                    {` ${formatOrderDate(purchasedate)}`}
                                </Text>
                            </Text>
                        </View>

                        <View style={{ paddingHorizontal: 5 }}>
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Medium', marginBottom: 5 }}>
                                Purchase No:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                    {` ${purchaseno}`}
                                </Text>
                            </Text>

                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                Purchase Created By:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                    {` ${purchase_created_by}`}
                                </Text>
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                        <View style={{ width: '8%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>#</Text>
                        </View>

                        <View style={{ width: '22%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5, }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>PRODUCT</Text>
                        </View>

                        <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, flexDirection: 'row' }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}>Type</Text>
                        </View>

                        <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase' }}>KG</Text>
                        </View>

                        <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5 }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>TON</Text>
                        </View>

                        <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>PCS</Text>
                        </View>
                    </View>

                    {purchasedetail.map((item, index) => (
                        <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                            <View style={{ width: '8%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular', padding: 3, }}>{index + 1}  </Text>
                            </View>

                            <View style={{ width: '22%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Bold', paddingHorizontal: 3, paddingTop: 3 }}>{item.preform_name}</Text>
                                {item.product_name &&
                                    <Text style={{ fontSize: 10, color: 'black', fontFamily: 'Inter-Regular', paddingHorizontal: 3, paddingBottom: 3 }}>{item.product_name}</Text>
                                }
                            </View>

                            <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, flexDirection: 'row' }}>
                                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular', padding: 3 }}>{item.preform_type}</Text>
                            </View>

                            <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular', padding: 3, textTransform: 'uppercase' }}>{item.kg_qty}</Text>
                            </View>

                            <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5 }}>
                                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular', padding: 3, }}>{item.ton_qty}</Text>
                            </View>

                            <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Inter-Regular', padding: 3, }}>{item.pcs_qty}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                        <View style={{ width: '45%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>Total</Text>
                        </View>

                        {/* <View style={{ width: '22%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5, }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}></Text>
                        </View> */}

                        {purchasedetail.some(item =>
                            ['SHIRINK', 'BOPP LABEL'].includes(item.preform_name?.toUpperCase())
                        ) ? (
                            <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase', fontSize: 12 }}>{formattedKg}</Text>
                            </View>
                        ) : (
                            <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase', fontSize: 12 }}></Text>
                            </View>
                        )}


                        <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, flexDirection: 'row' }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}></Text>
                        </View>

                        {/* <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5 }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}></Text>
                        </View>  */}

                        <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                            <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12 }}>{totalpcs}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>

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
                        {(hasCategoryPermissions.Delete) && (
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

export default Purchasedetail