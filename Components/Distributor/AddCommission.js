import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';

const AddCommission = ({ navigation, route }) => {
    const { customerdata } = route.params || {};
    const headerName = customerdata ? customerdata.area ? `  ${customerdata.company_name} (${customerdata.area})` : customerdata.companyname : '';

    const [rate, setRate] = useState({});
    const [initialRates, setInitialRates] = useState({});
    const [products, setproducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(false);

    const listproducts = async () => {
        setMainloading(true);
        const id = customerdata ? customerdata.c_id : '';
        const url = `${Constant.URL}${Constant.OtherURL.productlist}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                distributor_shop: id
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setproducts(result.Payload);
            const rates = result.Payload.reduce((acc, item) => {
                const price = item?.product_commission ? item.product_commission.toString() : ''; // Ensure string
                acc[item.product_id] = price;
                return acc;
            }, {});

            setRate(rates);
            setInitialRates(rates);
        } else {
            setproducts([]);
            setRate({});
            setInitialRates({});
            console.log('error while listing category');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listproducts();
        }, [])
    );

    const updateproductprice = async () => {
        setLoading(true);
        const id = customerdata ? customerdata.c_id : '';
        const allValidRates = Object.keys(rate).reduce((acc, productId) => {
            if (rate[productId]) {
                acc[productId] = rate[productId];
            }
            return acc;
        }, {});

        if (Object.keys(allValidRates).length == 0) {
            console.log('No commission values to update');
            setLoading(false);
            return;
        }
        const url = `${Constant.URL}${Constant.OtherURL.addproduct}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                distributor_shop: id,
                product_id: Object.keys(allValidRates),
                product_amount: Object.values(allValidRates)
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            listproducts();
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
                        {/* <View style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', }}>
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#173161' }}>{headerName}</Text>
                            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }}>{mobile}</Text>
                        </View> */}

                        {mainloading ? (
                            <View style={{ alignItems: 'center', marginTop: 10 }}>
                                <ActivityIndicator size="large" color="#173161" />
                            </View>
                        ) :
                            products.length == 0 ? (
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Products available</Text>
                            ) : (
                                products.map((item, index) => (
                                    <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff', }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>{item.product_name}</Text>
                                        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Commission:</Text>
                                            <TextInput value={rate[item.product_id] || ''}
                                                onChangeText={(text) => setRate((prevRates) => ({ ...prevRates, [item.product_id]: text }))} keyboardType='numeric' style={{ paddingVertical: 5, width: '50%', fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11 }} />

                                            {/* <TouchableOpacity onPress={() => updateproductstatus(item.product_id, item.status)} style={{ backgroundColor: item.status == 'Active' ? '#009900' : '#e60000', paddingHorizontal: 15, paddingVertical: 9, borderRadius: 10, marginLeft: 20 }}>
                                                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#fff' }}>{item.status == 'Active' ? 'Active' : 'Inactive'}</Text>
                                            </TouchableOpacity> */}
                                        </View>
                                    </View>
                                ))
                            )}

                    </View>
                </ScrollView>
                <TouchableOpacity onPress={() => { updateproductprice(); }} style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, margin: 10, alignItems: 'center' }} >
                    {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={{ color: !rate ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold', }}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default AddCommission