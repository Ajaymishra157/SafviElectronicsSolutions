import React, { useEffect, useState } from 'react';
import { Image, View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Keyboard, ToastAndroid, StatusBar, TouchableWithoutFeedback } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';


const AddService = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const editService = route.params?.service || null;
    const passedOrderId = route.params?.orderId || null;
    const passedOrderNo = route.params?.orderNo || null;
    const passedCustomerId = route.params?.customerid || null;
    const staffName = route.params?.staffName || null;
    console.log("staff Name ye hai", staffName);




    const [loading, setLoading] = useState(false);
    const [userList, setUserList] = useState([]);

    const [customerList, setCustomerList] = useState([]);
    const [orderList, setOrderList] = useState([]);

    const [userId, setUserId] = useState(editService ? editService.staff_id : null);
    const [customerId, setCustomerId] = useState(editService ? editService.customer_id : null);
    const [orderId, setOrderId] = useState(editService ? editService.order_id : null);
    const [orderNo, setOrderNo] = useState(passedOrderNo || '');

    const passedCustomerName = route.params?.customerName || null;


    const [serviceName, setServiceName] = useState(editService ? editService.service_name : '');
    const [amount, setAmount] = useState(editService ? editService.service_amount : '');



    const [openUser, setOpenUser] = useState(false);
    const [openCustomer, setOpenCustomer] = useState(false);
    const [openOrder, setOpenOrder] = useState(false);

    const [serviceNameError, setServiceNameError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [customerError, setCustomerError] = useState('');


    // 🧠 Prefill edit data AFTER lists load
    // 🧠 Prefill edit data AFTER lists load
    // useEffect(() => {
    //     if (
    //         editService &&
    //         userList.length > 0 &&
    //         customerList.length > 0
    //     ) {
    //         setUserId(String(editService.staff_id));
    //         setCustomerId(String(editService.customer_id));
    //         setServiceName(editService.service_name);
    //         setAmount(editService.service_amount);
    //     }
    // }, [editService, userList, customerList]);


    const listUsers = async () => {
        setLoading(true);
        try {
            // const id = await AsyncStorage.getItem('admin_id');
            const url = `${Constant.URL}${Constant.OtherURL.user_list}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });
            const result = await response.json();
            if (result.code == "200") {
                const formatted = result.Payload.map(item => ({
                    label: item.user_name,
                    value: String(item.userid),
                }));
                setUserList(formatted);
            } else {
                setUserList([]);
            }
        } catch (error) {
            console.log('Network error in listUsers:', error);
        } finally {
            setLoading(false);
        }
    };

    const listCustomers = async () => {
        setLoading(true);
        try {
            const url = `${Constant.URL}${Constant.OtherURL.customer_list}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (result.code == "200") {
                const formatted = result.Payload.map(item => ({
                    label: item.full_name,
                    value: String(item.c_id),
                }));
                setCustomerList(formatted);
            } else {
                setCustomerList([]);
            }
        } catch (error) {
            console.log('Network error in listCustomers:', error);
        } finally {
            setLoading(false);
        }
    };


    // const listOrders = async staffId => {
    //     if (!staffId) return;
    //     console.log("staff id ye hai", staffId);
    //     setLoading(true);
    //     try {
    //         const url = `${Constant.URL}${Constant.OtherURL.staff_wise_order_list}`;
    //         const response = await fetch(url, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ staff_id: staffId }),
    //         });
    //         const result = await response.json();
    //         if (result.code == '200') {
    //             const formatted = result.Payload.map(item => ({
    //                 label: `Order no ${item.order_no}`,
    //                 value: String(item.order_no),
    //             }));
    //             setOrderList(formatted);
    //         } else {
    //             setOrderList([]);
    //         }
    //     } catch (error) {
    //         console.log('Network error in listOrders:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     if (userId) listOrders(userId);
    // }, [userId]);;

    useFocusEffect(
        React.useCallback(() => {
            listUsers();
            listCustomers();
        }, [])
    );

    useEffect(() => {
        if (passedCustomerId) {
            setCustomerId(String(passedCustomerId));
            console.log("🟢 Received customerId:", passedCustomerId);
        }
    }, [passedCustomerId]);



    const handleSubmit = async () => {
        let valid = true;

        if (!customerId) {
            setCustomerError('Customer is required');
            valid = false;
        } else {
            setCustomerError('');
        }

        if (!serviceName.trim()) {
            setServiceNameError('Service name is required');
            valid = false;
        } else {
            setServiceNameError('');
        }

        if (!amount.trim()) {
            setAmountError('Amount is required');
            valid = false;
        } else {
            setAmountError('');
        }

        if (!valid) return;

        setLoading(true);

        const adminId = await AsyncStorage.getItem('admin_id');
        if (!adminId) {
            alert('User ID not found. Please log in again.');
            setLoading(false);
            return;
        }

        const isEdit = !!editService;
        const url = isEdit
            ? `${Constant.URL}${Constant.OtherURL.update_service}`
            : `${Constant.URL}${Constant.OtherURL.add_service}`;

        const payload = isEdit
            ? {
                service_id: editService.service_id,
                staff_id: userId,
                cust_id: customerId,
                service_name: serviceName,
                service_amount: amount,
                order_no: orderNo || '', // optional
            }
            : {
                staff_id: userId,
                cust_id: customerId,
                service_name: serviceName,
                service_amount: amount,
                order_no: orderNo || '',
            };

        console.log('📦 Payload:', payload);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log('✅ API Response:', result);

            if (result.code === 200) {
                ToastAndroid.show(
                    isEdit ? 'Service updated successfully!' : 'Service added successfully!',
                    ToastAndroid.LONG
                );
                navigation.reset({
                    index: 1,
                    routes: [
                        { name: 'Dashboard' },  // Keep HomeScreen in the stack
                        { name: 'Servicelist' }    // Navigate to Userslist
                    ],
                });
            } else {
                ToastAndroid.show('Operation failed, please try again.', ToastAndroid.LONG);
            }
        } catch (error) {
            console.log('❌ Error in handleSubmit:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <TouchableWithoutFeedback
            onPress={() => {
                Keyboard.dismiss();
                setOpenCustomer(false);

            }}
        >
            <View style={{ flex: 1, backgroundColor: '#F4F6FA' }}>
                <StatusBar backgroundColor="#173161" barStyle="light-content" />
                {/* Header */}
                <View
                    style={{
                        backgroundColor: '#173161',
                        flexDirection: 'row',
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 10,
                    }}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image
                            source={require('../../assets/arrow_back.png')}
                            style={{ height: 25, width: 25, tintColor: '#FFF' }}
                        />
                    </TouchableOpacity>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: '#FFF',
                            fontFamily: 'Inter-Bold',
                            fontSize: 16,
                        }}
                    >
                        {editService ? 'Update Service' : 'Add Service'}
                    </Text>
                    <Text
                        style={{
                            color: '#173161',
                            fontFamily: 'Inter-Regular',
                            fontSize: 18,
                        }}
                    >
                        ..
                    </Text>
                </View>

                <ScrollView nestedScrollEnabled={true} style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 15 }} keyboardShouldPersistTaps="handled">
                    {loading && (
                        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
                    )}



                    {/* Order Dropdown */}
                    {/* <View style={{ marginBottom: 15, marginTop: 10, zIndex: openOrder ? 10 : 1 }}>
                        <Text
                            style={{
                                color: 'gray',
                                fontFamily: 'Inter-Regular',
                                fontSize: 12,
                                marginLeft: 5,
                                marginBottom: 5,
                            }}>
                            Order
                        </Text>
                        <DropDownPicker
                            placeholder="Select Order"
                            open={openOrder}
                            value={orderId}
                            items={orderList}
                            setOpen={(isOpen) => {
                                setOpenOrder(isOpen);
                                if (isOpen) Keyboard.dismiss();
                            }}

                            setValue={setOrderId}
                            style={{
                                height: 40,
                                borderRadius: 10,
                                borderColor: 'gray',
                                backgroundColor: '#F5F5F5',
                            }}
                            textStyle={{
                                fontFamily: 'Inter-Medium',
                                fontSize: 14,
                                color: '#000',
                            }}
                            dropDownContainerStyle={{
                                alignSelf: 'center',
                                borderColor: '#CCC',
                                width: '100%',
                                backgroundColor: '#fff',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 3,
                                elevation: 3,
                                zIndex: 1000,
                            }}
                            // ✅ Add this ↓↓↓↓↓↓↓
                            listMode="MODAL"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />

                    </View> */}


                    {/* Customer Dropdown */}
                    {/* <View style={{ marginBottom: 10, zIndex: openCustomer ? 10 : 1 }}>
                        <Text
                            style={{
                                color: 'gray',
                                fontFamily: 'Inter-Regular',
                                fontSize: 12,
                                marginLeft: 5,
                                marginBottom: 5,
                            }}>
                            Customer <Text style={{ color: '#e60000' }}>*</Text>
                        </Text>
                        <DropDownPicker
                            placeholder="Select Customer"
                            open={openCustomer}
                            value={customerId}
                            items={customerList}
                            setOpen={(isOpen) => {
                                setOpenCustomer(isOpen);
                                if (isOpen) Keyboard.dismiss();
                            }}

                            setValue={(callback) => {
                                setCustomerId((currentValue) => {
                                    const newValue = callback(currentValue);
                                    if (newValue) setCustomerError(''); // clear error
                                    return newValue;
                                });
                            }}

                            style={{
                                height: 40,
                                borderRadius: 10,
                                borderColor: customerError ? 'red' : 'gray',
                                backgroundColor: '#F5F5F5',
                            }}
                            textStyle={{
                                fontFamily: 'Inter-Medium',
                                fontSize: 14,
                                color: '#000',
                            }}
                            dropDownContainerStyle={{
                                alignSelf: 'center',
                                borderColor: '#CCC',
                                width: '100%',
                                backgroundColor: '#fff',
                                elevation: 3,
                                zIndex: 999,
                                marginTop: 3,
                                borderRadius: 10
                            }}
                            // ✅ Add this ↓↓↓↓↓↓↓
                            listMode="MODAL"
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />
                        {customerError ? (
                            <Text style={{ color: 'red', fontSize: 12, marginTop: 12, marginLeft: 5 }}>
                                {customerError}
                            </Text>
                        ) : null}
                    </View> */}
                    {/* Customer Info Display */}
                    {passedCustomerName && (
                        <View style={{
                            backgroundColor: '#F5F5F5',
                            padding: 12,
                            borderRadius: 10,
                            marginTop: 15,
                            marginBottom: 10,
                            borderWidth: 1,
                            borderColor: '#ddd',
                        }}>
                            <Text style={{
                                fontFamily: 'Inter-SemiBold',
                                color: '#173161',
                                fontSize: 15,
                                marginBottom: 4,
                            }}>
                                Customer Name: {passedCustomerName}
                            </Text>
                            {orderNo ? (
                                <Text style={{
                                    fontFamily: 'Inter-Medium',
                                    color: '#555',
                                    fontSize: 13,
                                }}>
                                    Order No: {orderNo}
                                </Text>
                            ) : null}
                            {staffName ? (
                                <Text style={{
                                    fontFamily: 'Inter-Medium',
                                    color: '#555',
                                    fontSize: 13,
                                }}>
                                    Staff Name: {staffName}
                                </Text>
                            ) : null}

                        </View>
                    )}

                    {/* User Dropdown */}
                    <View style={{ marginBottom: 15, marginTop: 10, zIndex: openUser ? 10 : 1 }}>
                        <Text
                            style={{
                                color: 'gray',
                                fontFamily: 'Inter-Regular',
                                fontSize: 12,
                                marginLeft: 5,
                                marginBottom: 5,
                            }}>
                            Staff
                        </Text>
                        <DropDownPicker
                            placeholder="Select Staff"
                            open={openUser}
                            value={userId}
                            items={userList}
                            setOpen={setOpenUser}
                            setValue={setUserId}
                            searchable={true}
                            searchablePlaceholder="Search Staff..."
                            listMode="MODAL"
                            modalProps={{
                                keyboardShouldPersistTaps: 'always', // ✅ THIS LINE FIXES DOUBLE TAP ISSUE
                            }}
                            searchContainerStyle={{
                                borderBottomColor: '#dfdfdf',
                                borderBottomWidth: 1,
                            }}
                            searchTextInputStyle={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color: '#000',
                            }}
                            style={{
                                height: 40,
                                borderRadius: 10,
                                borderColor: 'gray',
                                backgroundColor: '#F5F5F5',
                            }}
                            textStyle={{
                                fontFamily: 'Inter-Medium',
                                fontSize: 14,
                                color: '#000',
                            }}
                            dropDownContainerStyle={{
                                alignSelf: 'center',
                                borderColor: '#CCC',
                                width: '100%',
                                backgroundColor: '#fff',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 3,
                                elevation: 3,
                                zIndex: 1000,
                            }}
                            scrollViewProps={{
                                nestedScrollEnabled: true,
                            }}
                        />

                    </View>


                    {/* Service Name */}
                    <View style={{ marginBottom: 10, marginTop: 5 }}>
                        <Text
                            style={{
                                color: 'gray',
                                fontFamily: 'Inter-Regular',
                                fontSize: 12,
                                marginLeft: 5,
                                marginBottom: 5,
                            }}>
                            Service Name <Text style={{ color: '#e60000' }}>*</Text>
                        </Text>
                        <TextInput
                            value={serviceName}
                            onChangeText={(text) => {
                                setServiceName(text);
                                if (text.trim() !== '') setServiceNameError('');
                            }}
                            placeholder="Enter Service Name"
                            placeholderTextColor='#ccc'
                            style={{
                                height: 40,
                                borderWidth: 1,
                                borderColor: serviceNameError ? 'red' : 'gray',
                                borderRadius: 10,
                                backgroundColor: '#F5F5F5',
                                paddingHorizontal: 10,
                                fontFamily: 'Inter-Medium',
                                fontSize: 14,
                                color: '#000',
                            }}
                        />
                        {serviceNameError ? (
                            <Text style={{ color: 'red', fontSize: 12, marginLeft: 5, marginTop: 3 }}>
                                {serviceNameError}
                            </Text>
                        ) : null}
                    </View>

                    {/* Amount */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ color: 'gray', fontSize: 12, marginLeft: 5 }}>
                            Amount <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                        <TextInput
                            value={amount}
                            onChangeText={(text) => {
                                setAmount(text);
                                if (text.trim() !== '') setAmountError(''); // ✅ Clear error when typing
                            }}
                            placeholder="Enter Amount"
                            placeholderTextColor="#ccc"
                            keyboardType="numeric"
                            style={{
                                height: 40,
                                borderWidth: 1,
                                borderColor: amountError ? 'red' : 'gray',
                                borderRadius: 10,
                                backgroundColor: '#F5F5F5',
                                paddingHorizontal: 10,
                                fontSize: 14,
                                color: '#000',
                            }}
                        />
                        {amountError ? (
                            <Text style={{ color: 'red', fontSize: 12, marginTop: 3, marginLeft: 5 }}>
                                {amountError}
                            </Text>
                        ) : null}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={{
                            backgroundColor: '#173161',
                            borderRadius: 10,
                            paddingVertical: 12,
                            alignItems: 'center',
                            marginTop: 10,
                            marginBottom: 40,
                        }}>
                        <Text
                            style={{
                                color: '#fff',
                                fontSize: 16,
                                fontFamily: 'Inter-SemiBold',
                            }}>
                            {editService ? 'Update Service' : 'Add Service'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

        </TouchableWithoutFeedback>
    );
};

export default AddService;
