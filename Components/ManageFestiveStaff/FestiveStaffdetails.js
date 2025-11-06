import { View, Text, ActivityIndicator, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';

const FestiveStaffdetails = ({ navigation, route }) => {
    const { staffid, staffname } = route.params || {};
    const [mainloading, setMainloading] = useState(false);
    const [attendance, setAttendance] = useState([]);
    const [stafforderlist, setStafforderlist] = useState([]);

    const listdetails = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.staff_transcription}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                staff_id: staffid
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setAttendance(result.payload.staff_attendance);
            setStafforderlist(result.payload.staff_order);
        } else {
            setAttendance([]);
            setStafforderlist([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listdetails();
        }, [])
    );

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatOrderDate = (dateString) => {
        if (!dateString) return "00-00-0000"; // Default if no date is provided
        const date = new Date(dateString); // Convert to Date object
        const day = String(date.getDate()).padStart(2, '0'); // Get day and pad if needed
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based, add 1)
        const year = date.getFullYear(); // Get full year
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // 12 AM/PM case

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={[styles.cell, { width: '30%' }]}>{formatDate(item.date)}</Text>
            <Text style={[styles.cell, { width: '70%' }]}>{item.company_name}</Text>
        </View>
    );

    const renderorderItem = ({ item, index }) => (
        <TouchableOpacity onLongPress={(e) => {
            const { pageX, pageY } = e.nativeEvent;
            openactionModal(item, pageX, pageY);
        }} style={{ flexDirection: 'row', borderWidth: 0.3, borderColor: 'black', paddingHorizontal: 5, }} >
            <Text style={{ width: 40, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {index + 1}
            </Text>
            <Text style={{ width: 130, fontSize: 12, color: '#000', textAlign: 'left', paddingHorizontal: 3, textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.product_name}
            </Text>
            <Text style={{ width: 50, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.item_qty}
            </Text>
            <Text style={{ width: 50, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.return_qty}
            </Text>
            <Text style={{ width: 50, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.sell_qty}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {formatOrderDate(item.entry_date)}
            </Text>
        </TouchableOpacity>
    );

    const getTotalQty = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.item_qty || 0), 0);
    };
    const getTotalreturnQty = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.return_qty || 0), 0);
    };
    const getTotalsellQty = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.sell_qty || 0), 0);
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
            <Subheader headername={staffname} />

            <View>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#000', textAlign: 'center', marginTop: 10 }}>Attendance</Text>
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={[styles.header]}>
                        <Text style={[styles.headerText, { width: '30%' }]}>Date</Text>
                        <Text style={[styles.headerText, { width: '70%' }]}>Company Name</Text>
                    </View>

                    {/* Table Data */}
                    <FlatList
                        data={attendance}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>

                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#000', textAlign: 'center', marginTop: 10, marginBottom: 5 }}>Transactions</Text>

                {stafforderlist?.length > 0 && (
                    <View style={{ marginBottom: 10, backgroundColor: '#fff', overflow: 'hidden', }}>
                        <ScrollView keyboardShouldPersistTaps='handled' horizontal>
                            <View>
                                {/* Header Row */}
                                <View style={{ flexDirection: 'row', paddingHorizontal: 5, borderWidth: 0.5, }} >
                                    <Text style={{ width: 40, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                        #
                                    </Text>
                                    <Text style={{ width: 130, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                        Product
                                    </Text>
                                    <Text style={{ width: 50, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                        Qty
                                    </Text>
                                    <Text style={{ width: 50, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                        Return
                                    </Text>
                                    <Text style={{ width: 50, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                        Sell
                                    </Text>
                                    <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                        Date
                                    </Text>
                                </View>

                                {/* Data Rows */}
                                <FlatList
                                    data={stafforderlist}
                                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                                    renderItem={renderorderItem}
                                    ListFooterComponent={() => (
                                        <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: 'black', paddingHorizontal: 5, backgroundColor: '#f2f2f2' }}>
                                            <Text style={{ width: 170, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                Total
                                            </Text>
                                            <Text style={{ width: 50, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                {getTotalQty()}
                                            </Text>

                                            <Text style={{ width: 50, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                {getTotalreturnQty()}
                                            </Text>

                                            <Text style={{ width: 50, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                {getTotalsellQty()}
                                            </Text>
                                            <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>

                                            </Text>
                                        </View>
                                    )}
                                />
                            </View>
                        </ScrollView>
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    table: {
        marginVertical: 10,
        marginHorizontal: 3,
        borderWidth: 0.5,
        borderColor: '#000',
        backgroundColor: '#fff'
    },
    row: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderColor: '#000',
        paddingVertical: 6,
        paddingHorizontal: 5,
    },
    header: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 5,
    },
    cell: {
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Inter-Regular',
        fontSize: 12
    },

    headerText: {
        textAlign: 'center',
        color: '#000',
        fontFamily: 'Inter-SemiBold'
    },
});

export default FestiveStaffdetails