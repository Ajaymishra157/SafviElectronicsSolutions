import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'


const MarginReportdetail = ({ navigation, route }) => {
    const { orderdate, margin, marginaftergst } = route.params || {}
    const [mainloading, setMainloading] = useState(false);
    const [data, setData] = useState([]);

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const displayStartDate = formatDate(orderdate);

    const formatDatedb = (isoDate) => {
        return new Date(isoDate).toISOString().split('T')[0]; // Extracts YYYY-MM-DD
    };

    const fetchMargindetail = async () => {
        setMainloading(true);
        const formattedstartDate = formatDatedb(orderdate);

        const url = `${Constant.URL}${Constant.OtherURL.order_margin_detail}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_date: formattedstartDate,
            }),
        });
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
            fetchMargindetail();
        }, [orderdate])
    );

    const totalcount = data.reduce((sum, item) => sum + parseFloat(item.margin || 0), 0);
    const totalBoxSum = data.reduce((sum, item) => sum + parseInt(item.margin_after_gst || 0), 0);
    return (
        <View style={{ flex: 1 }}>
            <Subheader headername={displayStartDate} />
            <View style={{ flex: 1, margin: 10 }}>

                {mainloading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#173161" />
                    </View>
                ) : (
                    <>
                        {/* <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', marginHorizontal: 10, marginBottom: 10 }}>{displayStartDate}</Text> */}
                        <View style={{ borderRadius: 10, padding: 10, marginBottom: 10, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
                            {/* <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', marginBottom: 5, width: '90%', }}>{name}</Text> */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Margin</Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{margin}</Text>
                                </View>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Margin After GST</Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{marginaftergst}</Text>
                                </View>
                            </View>
                        </View>


                        {data && data.length > 0 ? (
                            <ScrollView keyboardShouldPersistTaps='handled'>
                                <View style={{ marginHorizontal: 0, borderRadius: 10, padding: 0, marginBottom: 5, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>SR. No</Text>
                                        </View>
                                        <View style={{ width: '22%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Party</Text>
                                        </View>

                                        <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Order No</Text>
                                        </View>

                                        <View style={{ width: '20%', paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Margin</Text>
                                        </View>

                                        <View style={{ width: '30%', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Margin After GST</Text>
                                        </View>
                                    </View>

                                    {data.map((item, index) => (
                                        <View key={index} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                            <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{index + 1}</Text>
                                            </View>
                                            <View style={{ width: '22%', borderRightWidth: 1, flexDirection: 'row', borderColor: '#173161', paddingVertical: 3, paddingLeft: 5 }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', textAlign: 'left', fontSize: 12, textTransform: 'uppercase' }}>{item.company_name}</Text>
                                            </View>

                                            <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', paddingLeft: 5, alignItems: 'center', flexDirection: 'row' }}>
                                                <Text style={{ width: '80%', textAlign: 'left', color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.order_no}</Text>
                                                <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { order_no: item.order_no, orderdate, companyname: item.company_name, from: 'margin' })} style={{ width: '20%', alignItems: 'center', paddingVertical: 5, paddingRight: 10, }}>
                                                    <Image source={require('../../assets/info.png')} style={{ height: 20, width: 20 }} />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={{ width: '20%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.margin}</Text>
                                            </View>

                                            <View style={{ width: '30%', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.margin_after_gst}</Text>
                                            </View>
                                        </View>
                                    ))}
                                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                        <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', paddingVertical: 5, }}>Total</Text>
                                        </View>

                                        <View style={{ width: '20%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 12, textTransform: 'uppercase' }}>{totalcount}</Text>
                                        </View>

                                        <View style={{ width: '30%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 12, textTransform: 'uppercase' }}>{totalBoxSum}</Text>
                                        </View>

                                    </View>
                                </View>
                            </ScrollView>
                        ) : null}
                    </>
                )}
            </View>

        </View>
    )
}

export default MarginReportdetail