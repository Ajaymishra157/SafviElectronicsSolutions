import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native'
import React, { useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import Subheader from '../Commoncomponent/Subheader';

const Customerwise_sales = ({ navigation, route }) => {
    const { startdate, enddate, totalqty, totalamt } = route.params || {};
    const [data, setData] = useState([]);
    const [mainloading, setMainloading] = useState(false);

    const formatDate = (isoDate) => {
        return new Date(isoDate).toISOString().split('T')[0]; // Extracts YYYY-MM-DD
    };

    const formatDateDDMMYYYY = (isoDate) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const displayStartDate = formatDateDDMMYYYY(startdate);
    const displayEndDate = formatDateDDMMYYYY(enddate);

    const fetchdata = async () => {
        try {
            setMainloading(true);
            const url = `${Constant.URL}${Constant.OtherURL.customer_salesreport}`;

            const requestBody = {
                start_date: formatDate(startdate),
                end_date: formatDate(enddate),
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            const result = await response.json();
            if (result.code == "200") {
                setData(result.payload);
            } else {
                setData([]);
                console.log('Error in response:', result.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setMainloading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchdata();
        }, [startdate, enddate])
    );

    const totalAmountSum = data.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
    const totalBoxSum = data.reduce((sum, item) => sum + parseInt(item.total_qty || 0), 0);
    return (
        <View style={{ flex: 1 }}>
            <Subheader headername='Sales Report Details' />
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', marginHorizontal: 10, marginVertical: 10 }}>{displayStartDate}-{displayEndDate}</Text>
                    <View style={{ borderColor: '#173161', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 5, marginHorizontal: 5, backgroundColor: '#fff' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Quantity</Text>
                                <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{totalqty} (Box)</Text>
                            </View>
                            <View>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Amount</Text>
                                <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{totalamt}</Text>
                            </View>
                        </View>
                    </View>

                    {/* <View style={{ borderWidth:0.5, borderColor:'#d3d3d3', marginVertical:5, marginBottom:10 }}></View> */}


                    {mainloading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#173161" />
                        </View>
                    ) : (
                        data && data.length > 0 ? (
                            <View style={{ marginHorizontal: 5, borderRadius: 10, padding: 0, marginBottom: 5, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>SR. No</Text>
                                    </View>
                                    <View style={{ width: '42%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Party</Text>
                                    </View>
                                    <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Box</Text>
                                    </View>
                                    <View style={{ width: '30%', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Amount</Text>
                                    </View>
                                </View>

                                {data.map((item, index) => (
                                    <View key={index} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                        <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{index + 1}</Text>
                                        </View>
                                        <View style={{ width: '42%', borderRightWidth: 1, flexDirection: 'row', borderColor: '#173161', justifyContent: 'center', paddingVertical: 3, paddingLeft: 5 }}>
                                            <Text style={{ width: '80%', color: '#173161', fontFamily: 'Inter-SemiBold', textAlign: 'left', fontSize: 12, textTransform: 'uppercase' }}>{item.company_name}{item.area ? ` (${item.area})` : ''}</Text>
                                            <TouchableOpacity onPress={() => navigation.navigate('Productsales_customerwise', { totalamt: item.total_amount, totalqty: item.total_qty, customerid: item.customer_id, startdate: startdate, enddate: enddate, company_name: item.company_name, area: item.area })} style={{ paddingLeft: 10, paddingBottom: 10, alignSelf: 'center', width: '20%' }}>
                                                <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.total_qty}</Text>
                                        </View>
                                        <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.total_amount}</Text>
                                        </View>

                                    </View>
                                ))}
                                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                    <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', paddingVertical: 5, }}>Total</Text>
                                    </View>
                                    <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 12, textTransform: 'uppercase' }}>{totalBoxSum}</Text>
                                    </View>
                                    <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 12, textTransform: 'uppercase' }}>{totalAmountSum}</Text>
                                    </View>

                                </View>
                            </View>
                        ) : (
                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 16, textAlign: 'center', marginTop: 10 }}>
                                No Records Found
                            </Text>
                        )
                    )}
                </ScrollView>
            </View>
        </View>
    )
}

export default Customerwise_sales