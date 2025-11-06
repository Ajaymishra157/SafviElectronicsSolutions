import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyButton from '../Commoncomponent/MyButton';

const Purchaseentry = ({ navigation }) => {
    const [mainloading, setMainloading] = useState(null);
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [purchaselist, setPurchaselist] = useState([]);

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

    const listpurchase = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.listpurchase}`;
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
            setPurchaselist(result.payload);
        } else {
            setPurchaselist([]);
            console.log('error while listing purchase list');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
            listpurchase();
        }, [])
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the yea

        return `${day}/${month}/${year}`;
    };
    const hasCategoryPermissions = permissions['Purchase Entry'] || {};


    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="Purchase List" />
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled' nestedScrollEnabled={true}>
                    {purchaselist.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No Purchase available</Text>
                    ) : (
                        purchaselist.map((item, index) => (
                            <View key={index} style={{ gap: 10, marginBottom: 5, marginTop: 5, }}>
                                <View style={{
                                    backgroundColor: '#fff', borderRadius: 10, padding: 10, marginHorizontal: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
                                }}>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                                        <View style={{ width: '85%' }}>
                                            <View style={{ flexDirection: 'row', }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Purchase Number: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.purchase_no}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Purchase Date: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{formatDate(item.purchase_date)}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Total {(item.type == 'SHIRINK' || item.type == 'BOPP LABEL') ? 'Kg' : 'Pcs'}: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{(item.type == 'SHIRINK' || item.type == 'BOPP LABEL') ? item.total_per_kg : item.total_pcs}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Bill No: </Text>
                                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{item.bill_no}</Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', width: '100%' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Purchase Created By:
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}> {item.purchase_created_by}</Text></Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => navigation.navigate('Purchasedetail', { purchaseno: item.purchase_no, partyname: item.party_name, billno: item.bill_no, purchasedate: item.purchase_date, purchase_created_by: item.purchase_created_by, partyid: item.party_id })} style={{ paddingHorizontal: 15, paddingVertical: 0 }}>
                                            <Image source={require('../../assets/skip-track.png')} style={{ height: 15, width: 15 }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            <View style={{ gap: 10, margin: 10 }}>
                {/* <View>
                    <MyButton btnname="Stock Report" btnWidth={180} background="#173161" fontsize={14} textcolor="#FFF" />
                </View> */}
                {hasCategoryPermissions.Add && (
                    <View>
                        <MyButton btnname="Purchase Entry" background="#173161" fontsize={14} textcolor="#FFF" runFunc={() => navigation.navigate('Addpurchaseentry')} />
                    </View>
                )}
            </View>
        </View>
    )
}

export default Purchaseentry