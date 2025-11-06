import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import Subheader from '../Commoncomponent/Subheader';

const FestiveCustomers = ({ navigation }) => {
    const [mainloading, setMainloading] = useState(false);
    const [festiveshops, setFestiveShops] = useState([]);

    const festivecustomers = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.festival_shop_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setFestiveShops(result.payload);
        } else {
            setFestiveShops([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            festivecustomers();
        }, [])
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
            <Subheader headername={'Customers'} />
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    {festiveshops.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Customers available</Text>
                    ) : (
                        festiveshops.map((item, index) => (
                            <TouchableOpacity disabled={true} key={index} style={{ gap: 10, marginVertical: 5, marginHorizontal: 5 }}>
                                <View style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <TouchableOpacity activeOpacity={1} style={{ width: '50%' }}>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.company_name}{item.area ? ` (${item.area})` : ''}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => navigation.navigate('FestiveProductPrice', { companyname: item.company_name, mobile: item.moblie_no, area: item.area, customerid: item.c_id })} style={{ padding: 8 }}>
                                            <Image source={require('../../assets/skip-track.png')} style={{ height: 18, width: 18, tintColor: '#000' }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
        </View>
    )
}

export default FestiveCustomers