import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';

const Paymentcollection = ({ navigation, route }) => {
    const { startdate, enddate, mode } = route.params;
    const [data, setData] = useState([]);
    const [mainloading, setMainloading] = useState(false);

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const displayStartDate = formatDate(startdate);
    const displayEndDate = formatDate(enddate);

    const formatDatedb = (isoDate) => {
        return new Date(isoDate).toISOString().split('T')[0]; // Extracts YYYY-MM-DD
    };

    const fetchpaymentlist = async () => {
        setMainloading(true);
        const formattedstartDate = formatDatedb(startdate);
        const formattedendDate = formatDatedb(enddate);
        const url = `${Constant.URL}${Constant.OtherURL.list_amount}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedstartDate,
                end_date: formattedendDate,
                payment_mode: mode
            }),
        });
        console.log(formattedstartDate, formattedendDate, mode);
        const result = await response.json();
        if (result.code == "200") {
            setData(result.payload);
        } else {
            setData([]);
            console.log('error while fetching data');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            fetchpaymentlist();
        }, [startdate, enddate, mode])
    );

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <Subheader headername='Payment Collection' />
            <View style={{ flex: 1, marginTop: 10 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>

                    {data.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Orders available</Text>
                    ) : (
                        data.map((group, groupindex) => (
                            <View key={groupindex} style={{ marginBottom: 10 }}>
                                {group.entries.map((item, index) => (
                                    <View key={index} style={{ borderRadius: 10, padding: 10, marginHorizontal: 10, marginBottom: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', gap: 5 }}>
                                        <View style={{ flexDirection: 'row', gap: 5, width: '90%' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignItems: 'center' }}>Name:</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.party_name}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Amount:</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.paid_amount}</Text>

                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Date:</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{new Date(item.payment_date).toLocaleDateString('en-GB')}</Text>
                                        </View>

                                        <View style={{ borderWidth: 0.5, borderColor: '#D3D3D3', marginVertical: 3 }}></View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order No:</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.order_no}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Delivered Date:</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{new Date(item.order_date).toLocaleDateString('en-GB')}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Order Amount:</Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{item.order_amount}</Text>
                                        </View>
                                    </View>
                                ))}
                                <View style={{ marginHorizontal: 10, borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#e6ecff', }}>
                                    <Text style={{ marginLeft: 15, fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>Date: {group.payment_date ? new Date(group.payment_date).toLocaleDateString("en-GB") : ''}</Text>
                                    <Text style={{ marginLeft: 15, fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{mode} Amount: {group.total_paid_amount}</Text>
                                </View>
                            </View>
                        )))}
                </ScrollView>
            </View>
        </View >
    )
}

export default Paymentcollection