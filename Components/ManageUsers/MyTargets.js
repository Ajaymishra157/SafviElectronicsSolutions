import { View, Text, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator, TextInput, Alert, Keyboard, BackHandler, TouchableWithoutFeedback } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import { useFocusEffect } from '@react-navigation/native'
import Constant from '../Commoncomponent/Constant'
import AsyncStorage from '@react-native-async-storage/async-storage'

const MyTargets = ({ navigation }) => {
    const [mainloading, setMainloading] = useState(true);
    const [Bdmtargets, setBdmtargets] = useState([]);

    const listbdmtargets = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.list_bdm}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                salesman_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setBdmtargets(result.payload);
        } else {
            setBdmtargets([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listbdmtargets();
        }, [])
    );

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2); // get last two digits
        return `${day}/${month}/${year}`;
    };

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="My Targets" />
            <View style={{ marginVertical: 10, flex: 1 }}>

                <ScrollView keyboardShouldPersistTaps='handled' style={{ marginHorizontal: 0 }}>
                    {Bdmtargets && Bdmtargets.length > 0 ? (
                        <View style={{ marginHorizontal: 5, borderRadius: 10, padding: 0, marginBottom: 5, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '40%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                    <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12 }}>Month (Duration)</Text>
                                </View>
                                <View style={{ width: '30%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                    <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12 }}>BOX Target</Text>
                                </View>
                                <View style={{ width: '30%', paddingVertical: 10, alignItems: 'center' }}>
                                    <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12 }}>Achieved Target</Text>
                                </View>
                            </View>

                            {Bdmtargets.map((item, index) => (
                                <View key={index} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161', alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ width: '40%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 2, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12 }}>{item.month}</Text>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-Normal', fontSize: 12 }}>({item.start_date ? formatDate(item.start_date) : ""} - {item.end_date ? formatDate(item.end_date) : ""})</Text>
                                    </View>
                                    <View style={{ width: '30%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>{item.bdm_target}</Text>
                                    </View>
                                    <View style={{ width: '30%', paddingVertical: 10, alignItems: 'center' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>{item.achieve_target}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No BDM Target available</Text>
                    )}
                </ScrollView>
            </View>
        </View>
    )
}

export default MyTargets