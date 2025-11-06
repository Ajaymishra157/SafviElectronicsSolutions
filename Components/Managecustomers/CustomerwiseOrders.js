import { View, Text, ActivityIndicator, RefreshControl, ScrollView } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'

const CustomerwiseOrders = ({ navigation, route }) => {
    const { customerid, companyname, area } = route.params || {}
    const headerName = area ? `  ${companyname} (${area})` : companyname;
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState([]);

    const listOrders = async () => {
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.customerorderlist}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setOrders(result.payload); // Save the original list
        } else {
            setOrders([]);
            console.log('error while listing category');
        }
        setLoading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listOrders();
        }, [])
    );

    const onRefresh = React.useCallback(() => {
        listOrders().then(() => setRefreshing(false));
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <Subheader headername={headerName} />

            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled' style={{ margin: 10 }} refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                    {orders.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Orders available</Text>
                    ) : (
                        orders.map((item, index) => (
                            <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginBottom: 5, }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order Number: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.order_no}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order Date: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>
                                        {item.order_date
                                            ? new Date(item.order_date).toLocaleDateString("en-GB") + ' ' +
                                            new Date(item.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                            : ""}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 20 }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Paid: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.paid_amount}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Due: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.due_amount}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.total_price}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Status: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.status}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Party Created By: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.customer_created_by}</Text>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order By: </Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.order_by}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    )
}

export default CustomerwiseOrders