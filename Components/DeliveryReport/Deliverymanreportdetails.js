import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant'
import { useFocusEffect } from '@react-navigation/native'

const Deliverymanreportdetails = ({ navigation, route }) => {
    const { startdate, enddate, userid, delivered_order, delivered_qty, name } = route.params || {}
    const [mainloading, setMainloading] = useState(false);
    const [data, setData] = useState([]);

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

    const fetchdeliverymanreport = async () => {
        setMainloading(true);
        const formattedstartDate = formatDatedb(startdate);
        const formattedendDate = formatDatedb(enddate);

        const url = `${Constant.URL}${Constant.OtherURL.man_partywised}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedstartDate,
                end_date: formattedendDate,
                user_id: userid
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
            fetchdeliverymanreport();
        }, [startdate, enddate])
    );

    const totalcount = data.reduce((sum, item) => sum + parseFloat(item.order_count || 0), 0);
    const totalBoxSum = data.reduce((sum, item) => sum + parseInt(item.total_qty || 0), 0);

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername={name} />
            <View style={{ flex: 1, margin: 10 }}>

                {mainloading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#173161" />
                    </View>
                ) : (
                    <>
                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', marginHorizontal: 10, marginBottom: 10 }}>{displayStartDate}-{displayEndDate}</Text>
                        <View style={{ borderRadius: 10, padding: 10, marginBottom: 10, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
                            {/* <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', marginBottom: 5, width: '90%', }}>{name}</Text> */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total Delivery</Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{delivered_order}</Text>
                                </View>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total</Text>
                                    <Text style={{ fontFamily: 'Inter-Regular', textAlign: 'center', fontSize: 14, color: '#173161' }}>{delivered_qty} (Box)</Text>
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
                                        <View style={{ width: '42%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Party</Text>
                                        </View>

                                        <View style={{ width: '25%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Delivery</Text>
                                        </View>

                                        <View style={{ width: '25%', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Box</Text>
                                        </View>
                                    </View>

                                    {data.map((item, index) => (
                                        <View key={index} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                            <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{index + 1}</Text>
                                            </View>
                                            <View style={{ width: '42%', borderRightWidth: 1, flexDirection: 'row', borderColor: '#173161', paddingVertical: 3, paddingLeft: 5 }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', textAlign: 'left', fontSize: 12, textTransform: 'uppercase' }}>{item.company_name}{item.area ? ` (${item.area})` : ''}</Text>
                                            </View>

                                            <View style={{ width: '25%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.order_count}</Text>
                                            </View>

                                            <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12, textTransform: 'uppercase' }}>{item.total_qty}</Text>
                                            </View>
                                        </View>
                                    ))}
                                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                        <View style={{ width: '50%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', paddingVertical: 5, }}>Total</Text>
                                        </View>

                                        <View style={{ width: '25%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 12, textTransform: 'uppercase' }}>{totalcount}</Text>
                                        </View>

                                        <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center' }}>
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

export default Deliverymanreportdetails