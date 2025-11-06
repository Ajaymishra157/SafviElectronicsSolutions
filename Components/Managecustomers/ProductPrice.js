import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, BackHandler } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';

const ProductPrice = ({ navigation, route }) => {
    const { companyname, mobile, area, customerid, from, order_no, randomno } = route.params || {};
    const headerName = area ? `  ${companyname} (${area})` : companyname;
    const [rate, setRate] = useState({});
    const [initialRates, setInitialRates] = useState({});
    const [products, setproducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            // listproducts();

            const onBackPress = () => {
                navigation.goBack(); // Or any custom behavior
                return true; // Prevent default behavior
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation])
    );


    const listproducts = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list_price}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setproducts(result.payload);
            const rates = {};
            result.payload.forEach(subcat => {
                subcat.products.forEach(item => {
                    rates[item.product_id] = item.amount ? item.amount.toString() : '';
                });
            });

            setRate(rates);
            setInitialRates(rates);
        } else {
            setproducts([]);
            setRate({});
            setInitialRates({});
            console.log('error while listing product');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listproducts();
        }, [])
    );

    const updateproductstatus = async (product_id, status) => {
        const url = `${Constant.URL}${Constant.OtherURL.status_update}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid,
                product_id: product_id,
                status: status == 'Active' ? 'Deactive' : 'Active'
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            listproducts();
        } else {
            console.log('fail to update status')
        }
    };

    const updateproductprice = async () => {
        setLoading(true);
        const updatedRates = Object.keys(rate).reduce((acc, productId) => {
            if (rate[productId] != initialRates[productId]) {
                acc[productId] = rate[productId];
            }
            return acc;
        }, {});

        if (Object.keys(updatedRates).length === 0) {
            console.log('No changes detected');
            setLoading(false);
            return;
        }
        const url = `${Constant.URL}${Constant.OtherURL.update_price}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid,
                product_ids: Object.keys(updatedRates),
                amounts: Object.values(updatedRates)
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            if (from == 'Createorder') {
                navigation.replace('CreateOrder', { companyname: companyname, mobile_no: mobile, area: area, order_no: order_no, customerid: customerid, random_no: randomno, from: 'productprice' });
            } else {
                listproducts();
            }
        } else {
            console.log('error while updating Product price');
        }
        setLoading(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername={headerName} />
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    <View style={{ marginHorizontal: 5, marginVertical: 5, gap: 5 }}>
                        <View style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', }}>
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#173161' }}>{headerName}</Text>
                            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }}>{mobile}</Text>
                        </View>

                        {mainloading ? (
                            <View style={{ alignItems: 'center', marginTop: 10 }}>
                                <ActivityIndicator size="large" color="#173161" />
                            </View>
                        ) :
                            products.length == 0 ? (
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Customers available</Text>
                            ) : (
                                products.map((subcat, subIndex) => (
                                    <View key={subIndex} style={{ marginBottom: 0, borderBottomWidth: 1, borderColor: '#173161', }}>
                                        {/* Subcategory Title */}
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: '#173161', marginBottom: 10, textAlign: 'center' }}>
                                            {subcat.subcategory_name}
                                        </Text>

                                        {/* Products under this subcategory */}
                                        {subcat.products.map((item, index) => (
                                            <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', marginBottom: 10 }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>{item.product_name}</Text>
                                                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Rate:</Text>
                                                    <TextInput
                                                        value={rate[item.product_id] || ''}
                                                        onChangeText={(text) => setRate(prevRates => ({ ...prevRates, [item.product_id]: text }))}
                                                        keyboardType='numeric'
                                                        style={{ paddingVertical: 5, width: '50%', fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }}
                                                    />

                                                    <TouchableOpacity
                                                        onPress={() => updateproductstatus(item.product_id, item.status)}
                                                        style={{ backgroundColor: item.status == 'Active' ? '#009900' : '#e60000', paddingHorizontal: 15, paddingVertical: 9, borderRadius: 10, marginLeft: 20 }}
                                                    >
                                                        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#fff' }}>
                                                            {item.status == 'Active' ? 'Active' : 'Inactive'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ))
                            )}

                    </View>
                </ScrollView>
                <TouchableOpacity onPress={() => { updateproductprice(); }} style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, margin: 10, alignItems: 'center' }} >
                    {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={{ color: !rate ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold', }}>Update</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ProductPrice

