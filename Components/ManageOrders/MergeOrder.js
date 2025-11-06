import { View, Text, ActivityIndicator, Linking, TouchableOpacity, ScrollView, Alert, Image } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import MyButton from '../Commoncomponent/MyButton';

const MergeOrder = ({ navigation, route }) => {
    const { selectedOrderNo } = route.params || {};
    const [myorders, setMyorders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const listmyorders = async (query) => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const usertype = await AsyncStorage.getItem('user_type');
        // const formattedDate = formatteddate.toISOString().split('T')[0];
        const searchQuery = query || "";
        const orderDate = null;
        const url = `${Constant.URL}${Constant.OtherURL.confirm_orderlist}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: usertype == 'Admin' ? '' : id,
                status: 'Pending',
                // order_date: orderDate,
                // search: searchQuery
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setMyorders(result.payload);
        } else {
            setMyorders([]);
            console.log('error while listing orders');
        }
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listmyorders();
        }, [])
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // 12 AM/PM case

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    const confirmMergeOrder = () => {
        Alert.alert(
            "Confirm Merge",
            `Are you sure you want to merge order ${selectedOrder} with order ${selectedOrderNo}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Merge",
                    onPress: mergeorder
                }
            ]
        );
    };

    const mergeorder = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.merge_order}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: selectedOrderNo,
                merge_order_no: selectedOrder,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            navigation.goBack(null);
        } else {
            console.log('error while merging order');
        }
        setMainloading(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="Merge Order" />
            <View style={{ flex: 1, paddingTop: 5 }}>
                <Text style={{ color: '#173161', textAlign: 'center', fontFamily: 'Inter-Bold', fontSize: 16, marginHorizontal: 10 }}>Merge order with order no: {selectedOrderNo}</Text>
                <ScrollView keyboardShouldPersistTaps='handled' nestedScrollEnabled={true}>
                    {loading ? (
                        <View style={{ alignItems: 'center', marginTop: 200 }}>
                            <ActivityIndicator size="large" color="#173161" />
                        </View>
                    ) :
                        myorders.length == 0 ? (
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Orders available</Text>
                        ) : (
                            myorders.filter(item => item.order_no != selectedOrderNo && item.merge_order == null && item.status == 'Pending')
                                .map((item, index) => (
                                    <View key={index} style={{ gap: 10, paddingBottom: 5, paddingTop: 5 }}>
                                        <View style={{
                                            backgroundColor:
                                                item.status == 'Pending' && item.set_urgent == 'Yes'
                                                    ? '#ffcccc'
                                                    : item.payment_mode == 'Cash'
                                                        ? '#ccffcc' // Green for Cash
                                                        : item.payment_mode == 'Baki'
                                                            ? '#ffcc99' // Orange for Baki
                                                            : item.payment_mode == 'Bank Transfer'
                                                                ? '#d3d3d3' // Gray for Bank Transfer
                                                                : item.status == 'Loading' ? '#ffffcc'
                                                                    : item.status == 'On The Way' ? '#ccccff'
                                                                        : '#fff', borderRadius: 10, padding: 10, marginHorizontal: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,

                                        }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order Number: </Text>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.order_no}</Text>
                                                </View>

                                                {/* {(item.status == 'Pending' || item.status == 'Loading' || item.status == 'On The Way' || item.status == 'Cancelled') &&
                                                <TouchableOpacity onPress={(e) => {
                                                    const { pageX, pageY } = e.nativeEvent;
                                                    openModal(item, pageX, pageY);
                                                }} style={{ paddingHorizontal: 10 }}>
                                                    <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20 }} />
                                                </TouchableOpacity>
                                            } */}

                                                <RadioButton
                                                    value={item.order_no}
                                                    status={selectedOrder == item.order_no ? 'checked' : 'unchecked'}
                                                    color='#173161'
                                                    onPress={() => setSelectedOrder(item.order_no)}
                                                />
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                                <View style={{ flexDirection: 'row', width: '85%', }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Name: </Text>
                                                    <Text style={{ width: '85%', fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.company_name}{item.area ? ` (${item.area})` : ''}</Text>
                                                </View>
                                                {item.location_link &&
                                                    <TouchableOpacity onPress={() => Linking.openURL(item.location_link)} style={{ paddingHorizontal: 10 }}>
                                                        <Image source={require('../../assets/map.png')} style={{ height: 20, width: 20 }} />
                                                    </TouchableOpacity>}
                                            </View>

                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                                                <View style={{ width: '85%' }}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order Date: </Text>
                                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{formatDate(item.order_date)}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 30 }}>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Paid:
                                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}> {item.paid_amount}</Text></Text>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Due:
                                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}> {item.due_amount}</Text></Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total: </Text>
                                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.total_price}</Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Due Payment: </Text>
                                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.total_due}</Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Status: </Text>
                                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.status}
                                                            {item.remarks && item.status == 'Cancelled' &&
                                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>({item.remarks})</Text>
                                                            }
                                                        </Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', width: '60%' }}>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order Remark: </Text>
                                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.order_remark}</Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', width: '100%' }}>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Customer Created By:
                                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}> {item.customer_created_by}</Text></Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order By: </Text>
                                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.user_name}</Text>
                                                    </View>

                                                    {item.status_data && (
                                                        <View>
                                                            {item.status_data['Loading by'] && (
                                                                <View style={{ flexDirection: 'row', width: '70%' }}>
                                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Loaded By: </Text>
                                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', width: '90%' }}>{item.status_data['Loading by'].name} ({formatDate(item.status_data['Loading by'].entry_date)})</Text>
                                                                </View>
                                                            )}

                                                            {item.type &&
                                                                <View style={{ flexDirection: 'row' }}>
                                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Transport: </Text>
                                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.type} ({item.vehicle_no})</Text>
                                                                </View>}

                                                            {item.status_data['On The Way by'] && (
                                                                <View style={{ flexDirection: 'row', width: '70%' }}>
                                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>On The Way By: </Text>
                                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', width: '90%' }}>{item.status_data['On The Way by'].name} ({formatDate(item.status_data['On The Way by'].entry_date)})</Text>
                                                                </View>
                                                            )}

                                                            {item.status_data['Delivered by'] && (
                                                                <View style={{ flexDirection: 'row', width: '70%' }}>
                                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', }}>Delivered By: </Text>
                                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', width: '90%' }}>{item.status_data['Delivered by'].name} ({formatDate(item.status_data['Delivered by'].entry_date)})</Text>
                                                                </View>
                                                            )}

                                                            {item.status_data['Cancelled by'] && (
                                                                <View style={{ flexDirection: 'row', width: '70%' }}>
                                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Cancelled By: </Text>
                                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', width: '90%' }}>{item.status_data['Cancelled by'].name} ({formatDate(item.status_data['Cancelled by'].entry_date)})</Text>
                                                                </View>
                                                            )}

                                                            {item.status_data['Pending by'] && (
                                                                <View style={{ flexDirection: 'row', width: '70%' }}>
                                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Pending By: </Text>
                                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', width: '90%' }}>{item.status_data['Pending by'].name} ({formatDate(item.status_data['Pending by'].entry_date)})</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                                {/* {(usertype == 'Admin' || usertype == 'Transporter' || (usertype == 'Salesman' && user_id === item.user_id)) && (
                        <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { order_no: item.order_no, orderdate: item.order_date, customername: item.full_name, Remark: item.remark, companyname: item.company_name, location_link: item.location_link, orderstatus: item.status, area: item.area, formatteddate, valuestatus })} style={{ paddingHorizontal: 15, paddingVertical: 50 }}>
                          <Image source={require('../../assets/skip-track.png')} style={{ height: 20, width: 20 }} />
                        </TouchableOpacity>
                      )} */}
                                            </View>
                                        </View>

                                    </View>
                                ))
                        )}
                </ScrollView>
            </View>

            {mainloading ?
                <ActivityIndicator size="large" color="#173161" />
                : <View style={{ marginHorizontal: 5, justifyContent: 'flex-end', marginBottom: 10 }}>
                    <MyButton btnname={"Merge Order"} background="#173161" fontsize={18} textcolor="#FFF" runFunc={confirmMergeOrder} />
                </View>
            }
        </View>
    )
}

export default MergeOrder