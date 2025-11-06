import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader';
import MyButton from '../Commoncomponent/MyButton';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const DistributedCustomer = ({ navigation, route }) => {
    const { customerdata } = route.params || {};
    const headerName = customerdata ? customerdata.area ? `  ${customerdata.company_name} (${customerdata.area})` : customerdata.companyname : '';

    const [customerlist, setCustomerList] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
    }, []);

    const listPermissions = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setPermissionsList(result.payload);
            // Prepare permissions state
            let permissionsData = {};
            result.payload.forEach((item) => {
                const permsArray = item.menu_permission.split(',');
                let permsObject = {};
                permsArray.forEach((perm) => {
                    permsObject[perm] = true;
                });
                permissionsData[item.menu_name] = permsObject;
            });

            setPermissions(permissionsData);
        } else {
            console.log('Error fetching permissions');
        }
        setMainloading(false);
    };

    const listcustomers = async () => {
        setLoading(true);
        const id = customerdata ? customerdata.c_id : '';
        const url = `${Constant.URL}${Constant.OtherURL.distributor_wised_shop_list}`;
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
            setCustomerList(result.payload);
        } else {
            setCustomerList([]);
            console.log('error while listing category');
        }
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
            listcustomers();
        }, [])
    );

    const hasdistributorPermissions = permissions['Distributor'] || {};

    if (mainloading) {
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
                {loading ? (
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                        <ActivityIndicator size="large" color="#173161" />
                    </View>
                ) : customerlist.length == 0 ? (
                    <Text style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: '#173161',
                        alignSelf: 'center',
                        marginTop: 100
                    }}>
                        No Customers available
                    </Text>
                ) : (
                    <FlatList
                        data={customerlist}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ padding: 10 }}
                        keyboardShouldPersistTaps='handled'
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity disabled={true} style={{ gap: 10, marginBottom: 10 }}>
                                <View style={{ borderRadius: 10, padding: 10, borderColor: '#E0E0E0', borderWidth: 1, backgroundColor: '#fff' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{index + 1}. </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.shop_name}{item.area ? ` (${item.area})` : ''}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                {hasdistributorPermissions.Add && (
                    <View style={{ marginVertical: 10 }}>
                        <MyButton btnname="Manage Customers" background="#173161" btnWidth={160} fontsize={14} textcolor="#FFF" runFunc={() => {
                            const customerIds = customerlist.map(item => item.shop_id);
                            navigation.navigate('AddCustomertodistributor', {
                                customerdata,
                                customerIds,
                            });
                        }} />
                    </View>
                )}

                <View style={{ marginVertical: 10 }}>
                    <MyButton btnname="Commission" background="#173161" btnWidth={160} fontsize={14} textcolor="#FFF" runFunc={() => navigation.navigate('AddCommission', { customerdata })} />
                </View>
            </View>
        </View>
    )
}

export default DistributedCustomer