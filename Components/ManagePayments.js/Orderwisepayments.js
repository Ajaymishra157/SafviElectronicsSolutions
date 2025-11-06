import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Orderwisepayments = ({ navigation, route }) => {
    const { order_no } = route.params || {};
    const [data, setData] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [paymentmodal, setPaymentmodal] = useState(false);
    const [paymentmethodopen, setPaymentMethodOpen] = useState(false); // Controls dropdown visibility
    const [paymentmethodvalue, setPaymentMethodValue] = useState(); // Selected payment method
    const [paymentmethoditems, setPaymentMethodItems] = useState([
        { label: 'Cash', value: 'Cash' },
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'Baki', value: 'Baki' },
    ]);

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

    const hasPermissions = permissions['Payment Type1'] || {};

    const listpayments = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.payment_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: order_no,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setData(result.payload);
        } else {
            setData([]);
            console.log('error while listing payment');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listpayments();
            listPermissions();
        }, [])
    );

    const openModal = (item, x, y) => {
        setModalPosition({ top: y - 15, left: x - 90 });
        // setSelectedCategory(category);
        // setValueinmodal(category.cid);
        // setAddsubcat(category.subcategory_name);
        setModalvisible(true);
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
            <Subheader headername='Order Record Payments' />

            <ScrollView keyboardShouldPersistTaps='handled' style={{ marginHorizontal: 10 }}>
                {data.length == 0 ? (
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Items Found</Text>
                ) : (
                    data.map((item, index) => (
                        <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginTop: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                <View style={{ flexDirection: 'row', width: '80%' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Date: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>
                                            {item.payment_date
                                                ? new Date(item.payment_date).toLocaleDateString("en-GB") : ""}
                                        </Text>
                                    </View>
                                </View>
                                {/* {hasPermissions.Update && (
                                <TouchableOpacity onPress={(e) => {
                                    const { pageX, pageY } = e.nativeEvent;
                                    openModal(item, pageX, pageY);
                                }}>
                                    <Image source={require('../../assets/threedot.png')} style={{ height: 17, width: 17, tintColor: '#173161' }} />
                                </TouchableOpacity>
                                 )} */}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Method: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.payment_mode}</Text>
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Amount: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.paid_amount}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Submitted By: </Text>
                                <Text style={{ width: '70%', fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.submited_by}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

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
                        <TouchableOpacity onPress={() => { setModalvisible(false) }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        {/* )} */}
                        {/* {hasCategoryPermissions.Delete && (
                        <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                        </TouchableOpacity>
                         )} */}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* update payment method */}

            <Modal visible={paymentmodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => setPaymentmodal(false)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 20, paddingTop: 20, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Payment Method
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <TouchableOpacity onPress={() => setPaymentmodal(false)} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginBottom: 10, marginTop: 10, zIndex: paymentmethodopen ? 20 : 10 }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Payment Method</Text>
                            <DropDownPicker
                                placeholder='Select Payment'
                                open={paymentmethodopen}
                                value={paymentmethodvalue}
                                items={paymentmethoditems}
                                setOpen={(isOpen) => {
                                    setPaymentMethodOpen(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                        setStatusOpen(false);
                                    }
                                }}
                                setValue={setPaymentMethodValue}
                                setItems={setPaymentMethodItems}
                                style={{
                                    width: '92%',
                                    height: 40,
                                    borderRadius: 10,
                                    borderColor: 'gray',
                                    backgroundColor: '#fff',
                                    alignSelf: 'center'
                                }}
                                textStyle={{
                                    fontFamily: 'Inter-Medium',
                                    fontSize: 14,
                                    color: '#000',
                                }}
                                placeholderStyle={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 14,
                                    color: 'gray',
                                }}
                                dropDownContainerStyle={{
                                    borderColor: '#fff',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 3,
                                    elevation: 2,
                                    backgroundColor: '#fff',
                                    maxHeight: 600
                                }}
                                dropDownDirection='BOTTOM'
                            />
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={() => {
                                    // Updatesubcategory(selectedCategory.subcategoryid); setModalvisible(false);
                                }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setPaymentmodal(false)} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                    <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default Orderwisepayments