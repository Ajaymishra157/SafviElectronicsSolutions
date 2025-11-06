import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Modal, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const FestiveOrderPayment = ({ navigation, route }) => {
    const { selectedOrder } = route.params || {};

    const [amount, setAmount] = useState(null);
    const [cashAmount, setCashAmount] = useState(null);
    const [onlineAmount, setOnlineAmount] = useState(null);
    const [lossamt, setLossamt] = useState(0);
    const [bakiamt, setBakiAmt] = useState(0);
    const [paymentlist, setPaymentlist] = useState([]);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [errors, setErrors] = useState({
        amount: '',
        cash: '',
        online: '',
        loss: '',
        baki: '',
    });

    // Prefill amount when screen loads
    useEffect(() => {
        if (selectedOrder?.order_price) {
            const total = Number(selectedOrder.order_price);
            setAmount(String(total));
        }
    }, [selectedOrder]);

    // When cash is entered
    const handleCashChange = (val) => {
        setCashAmount(val);

        const total = parseFloat(amount) || 0;
        const cash = parseFloat(val) || 0;
        const loss = parseFloat(lossamt) || 0;
        const baki = parseFloat(bakiamt) || 0;

        // Auto-fill online only once
        if (loss == 0 && total > 0 && cash <= total && baki == 0) {
            setOnlineAmount(String(total - cash));
        }
    };

    // When online is entered
    const handleOnlineChange = (val) => {
        setOnlineAmount(val);

        const total = parseFloat(amount) || 0;
        const cash = parseFloat(cashAmount) || 0;

        if (val === '' || parseFloat(val) === 0) {
            // Online cleared → Baki = total - cash
            setBakiAmt(String(total - cash));
        } else {
            // Online entered → Baki = total - cash - online
            setBakiAmt(String(total - cash - parseFloat(val)));
        }
    };

    // 🔹 Validation function
    const validatePaymentForm = (amount, cashAmount, onlineAmount, lossamt, bakiamt) => {
        let valid = true;
        let newErrors = { amount: '', cash: '', online: '', loss: '', baki: '' };

        const amt = parseFloat(amount) || 0;
        const cash = parseFloat(cashAmount) || 0;
        const online = parseFloat(onlineAmount) || 0;
        const loss = Number(lossamt) || 0;
        const baki = Number(bakiamt) || 0;

        // Amount validation
        if (!amt || amt <= 0) {
            newErrors.amount = 'Amount cannot be empty or 0';
            valid = false;
        }

        // At least one (cash or online) should be > 0
        if (cash == 0 && online == 0) {
            newErrors.cash = 'Enter cash amount';
            newErrors.online = 'Enter online amount';
            valid = false;
        }

        // Sum check
        if (cash + online + loss + baki > amt) {
            newErrors.cash = `Cash + UPI + loss + baki cannot exceed Amount (${amt})`;
            newErrors.online = `Cash + UPI + loss + baki cannot exceed Amount (${amt})`;
            newErrors.loss = `Cash + UPI + loss + baki cannot exceed Amount (${amt})`;
            newErrors.baki = `Cash + UPI + loss + baki cannot exceed Amount (${amt})`;
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const addstaffpayment = async () => {
        if (!validatePaymentForm(amount, cashAmount, onlineAmount, lossamt, bakiamt)) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.add_staff_payment}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                staff_id: selectedOrder.staff_id,
                // order_no: selectedOrder.order_no,
                staff_order_id: selectedOrder.id,
                total_amount: amount,
                cash_amount: cashAmount,
                online_amount: onlineAmount,
                loss_amount: lossamt,
                baki_amount: bakiamt
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            listPayment();
            setAmount('');
            setCashAmount('');
            setOnlineAmount('');
            setBakiAmt('');
            setLossamt('');
            setErrors('');
        } else {
            console.log('error while listing category');
        }
        setLoading(false);
    };

    const updatestaffpayment = async () => {
        if (!validatePaymentForm(amount, cashAmount, onlineAmount)) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.update_staff_payment}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payment_id: selectedPayment.payment_id,
                user_id: id,
                staff_id: selectedPayment.staff_id,
                // order_no: selectedPayment.order_no,
                staff_order_id: selectedPayment.staff_order_id,
                total_amount: amount,
                cash_amount: cashAmount,
                online_amount: onlineAmount,
                loss_amount: lossamt,
                baki_amount: bakiamt
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            listPayment();
            setSelectedPayment(null);
            setIsEditing(false);
            setAmount('');
            setCashAmount('');
            setOnlineAmount('');
            setBakiAmt('');
            setLossamt('');
            setErrors('');
        } else {
            console.log('error while listing category');
        }
        setLoading(false);
    };

    const listPayment = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_staff_payment_orderno_wise}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                staff_order_id: selectedOrder.id,
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setPaymentlist(result.payload)
        } else {
            setPaymentlist([]);
            console.log('error while listing paymnets');
        }
    };

    const handleDelete = async (id) => {
        const url = `${Constant.URL}${Constant.OtherURL.delete_staff_payment}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payment_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            listPayment();
        } else {
            console.log('error while delete')
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Staff Payment",
            `Are you sure you want to delete this payment?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete(selectedPayment.payment_id)
                }
            ]
        );
    };

    const openModal = (item, x, y) => {
        setSelectedPayment(item)
        setModalPosition({ top: y - 15, left: x - 110 });
        setModalvisible(true);
    };

    useFocusEffect(
        React.useCallback(() => {
            listPayment();
        }, [])
    );

    const formatDate = (dateString) => {
        if (!dateString) return "00-00-0000"; // Default if no date is provided
        const date = new Date(dateString); // Convert to Date object
        const day = String(date.getDate()).padStart(2, '0'); // Get day and pad if needed
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based, add 1)
        const year = date.getFullYear(); // Get full year
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // 12 AM/PM case

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername={'Staff Payment'} />
            <ScrollView
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#e6f0ff', paddingVertical: 10, borderRadius: 5, marginBottom: 5, marginHorizontal: 2 }}>
                    <View style={{ paddingHorizontal: 5 }}>
                        <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                            Staff Name:
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}> {selectedOrder.staff_name} </Text>
                        </Text>

                        <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                            Product Name:
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}> {selectedOrder.product_name} </Text>
                        </Text>

                        <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                            Product Price:
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}> {selectedOrder.product_price} </Text>
                        </Text>

                        <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                            Quantity:
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}> {selectedOrder.item_qty} </Text>
                        </Text>

                        <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                            Return Quantity:
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}> {selectedOrder.return_qty > 0 ? `${selectedOrder.return_qty} Box` : 0}{selectedOrder.return_pcs > 0 ? ` ${selectedOrder.return_pcs} Bottle` : 0} </Text>
                        </Text>

                        <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                            Sell :
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}> {selectedOrder.sell_qty} </Text>
                        </Text>

                        <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Medium' }}>
                            Date:
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular' }}> {formatDate(selectedOrder.entry_date)} </Text>
                        </Text>
                    </View>
                </View>

                {(paymentlist.length === 0 || isEditing) && (
                    <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 5 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                            Amount
                        </Text>
                        <TextInput
                            style={{ borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, height: 40, borderColor: errors.amount ? 'red' : 'gray', marginBottom: 5, color: '#000', fontFamily: 'Inter-Regular', }}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="Enter total amount"
                            placeholderTextColor={'gray'}
                            keyboardType="numeric"
                        />
                        {errors.amount ? <Text style={{ color: 'red', fontSize: 12 }}>{errors.amount}</Text> : null}

                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                            Cash
                        </Text>
                        <TextInput
                            style={{ borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, height: 40, borderColor: errors.cash ? 'red' : 'gray', marginBottom: 5, color: '#000', fontFamily: 'Inter-Regular', }}
                            value={cashAmount}
                            onChangeText={setCashAmount}
                            placeholder="Enter cash amount"
                            placeholderTextColor={'gray'}
                            keyboardType="numeric"
                        />
                        {errors.cash ? <Text style={{ color: 'red', fontSize: 12 }}>{errors.cash}</Text> : null}

                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                            UPI
                        </Text>
                        <TextInput
                            style={{ borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, height: 40, borderColor: errors.online ? 'red' : 'gray', marginBottom: 5, color: '#000', fontFamily: 'Inter-Regular', }}
                            value={onlineAmount}
                            onChangeText={setOnlineAmount}
                            placeholder="Enter UPI amount"
                            placeholderTextColor={'gray'}
                            keyboardType="numeric"
                        />
                        {errors.online ? <Text style={{ color: 'red', fontSize: 12 }}>{errors.online}</Text> : null}

                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                            Baki
                        </Text>
                        <TextInput
                            style={{ borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, height: 40, borderColor: errors.loss ? 'red' : 'gray', marginBottom: 5, color: '#000', fontFamily: 'Inter-Regular', }}
                            value={bakiamt}
                            onChangeText={setBakiAmt}
                            placeholder="Enter Baki amount"
                            placeholderTextColor={'gray'}
                            keyboardType="numeric"
                        />
                        {errors.baki ? <Text style={{ color: 'red', fontSize: 12 }}>{errors.baki}</Text> : null}

                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                            Loss
                        </Text>
                        <TextInput
                            style={{ borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, height: 40, borderColor: errors.loss ? 'red' : 'gray', marginBottom: 5, color: '#000', fontFamily: 'Inter-Regular', }}
                            value={lossamt}
                            onChangeText={setLossamt}
                            placeholder="Enter loss amount"
                            placeholderTextColor={'gray'}
                            keyboardType="numeric"
                        />
                        {errors.loss ? <Text style={{ color: 'red', fontSize: 12 }}>{errors.loss}</Text> : null}

                        <View style={{ alignItems: 'center', marginTop: 10, gap: 10 }}>
                            {loading ?
                                <ActivityIndicator size="large" color="#173161" />
                                : <TouchableOpacity onPress={isEditing ? updatestaffpayment : addstaffpayment} style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: 150 }} >
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold', textAlign: 'center' }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                )}

                <View style={{ marginHorizontal: 7 }}>
                    {paymentlist.length > 0 && (
                        <>
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#173161', marginVertical: 5, padding: 5, textAlign: 'center', borderRadius: 5, backgroundColor: '#e6f0ff' }} >
                                Payment List
                            </Text>

                            {paymentlist.map((item, index) => (
                                <View key={index} style={{ gap: 10, marginBottom: 5 }}>
                                    <View style={{ borderRadius: 7, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff' }}>

                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ flex: 1 }}>
                                                {/* <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>Name: </Text>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase' }}>{item.staff_name}</Text>
                                                </View> */}
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>Amount: </Text>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase' }}>{item.total_amount}</Text>
                                                </View>

                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                    {Number(item.cash_amount) > 0 && (
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>Cash: </Text>
                                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase' }}>
                                                                {item.cash_amount}
                                                            </Text>
                                                        </View>
                                                    )}

                                                    {Number(item.online_amount) > 0 && (
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>UPI: </Text>
                                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase' }}>
                                                                {item.online_amount}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>Baki: </Text>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase' }}>{item.baki_amount}</Text>
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>Loss: </Text>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161', textTransform: 'uppercase' }}>{item.loss_amount}</Text>
                                                </View>

                                            </View>

                                            {/* Three dot icon on the right */}
                                            <TouchableOpacity onPress={(e) => {
                                                const { pageX, pageY } = e.nativeEvent;
                                                openModal(item, pageX, pageY);
                                            }}>
                                                <Image source={require('../../assets/threedot.png')} style={{ height: 17, width: 17, tintColor: '#173161' }} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
                    {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
                        <TouchableOpacity onPress={() => {
                            setAmount(selectedPayment.total_amount);
                            setCashAmount(selectedPayment.cash_amount);
                            setOnlineAmount(selectedPayment.online_amount);
                            setBakiAmt(selectedPayment.baki_amount);
                            setLossamt(selectedPayment.loss_amount);
                            setIsEditing(true);
                            setModalvisible(false);
                        }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default FestiveOrderPayment