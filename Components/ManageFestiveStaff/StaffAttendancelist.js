import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import MyButton from '../Commoncomponent/MyButton';
import Subheader from '../Commoncomponent/Subheader';

const StaffAttendancelist = ({ navigation }) => {
    const [permissions, setPermissions] = useState({});
    const [attendancelist, setAttendancelist] = useState([]);
    const [mainloading, setMainloading] = useState(false);

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

    const listattendance = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.staff_attendance_list}`;
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
            setAttendancelist(result.payload); // Save the original list
        } else {
            setAttendancelist([]);
            console.log('error while listing category');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
            listattendance();
        }, [])
    );

    const hasPermissions = permissions['Staff Attendance'] || {};

    const formatDateTimeDisplay = (dateString) => {
        const dateObj = new Date(dateString);

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        let hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12

        const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        return `${day}/${month}/${year} ${formattedTime}`;
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
            <Subheader headername="Staff Attendance" />
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled' style={{ margin: 10 }}>
                    {attendancelist.length == 0 ? (
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', alignSelf: 'center', marginTop: 100 }}>No staff attendance available</Text>
                    ) : (
                        attendancelist.map((item, index) => (
                            <View key={index} style={{ gap: 10, marginBottom: 10 }}>
                                <View style={{ borderRadius: 10, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, backgroundColor: '#fff', }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row', width: '80%' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Start Date: </Text>
                                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{formatDateTimeDisplay(item.start_date)}</Text>
                                        </View>

                                        {(hasPermissions.Update || hasPermissions.Delete) && (
                                            <TouchableOpacity onPress={() => { navigation.navigate('StaffAttendance', { start_date: item.start_date, end_date: item.end_date, customerid: item.customer_id, id: item.id }); }}>
                                                <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'row', width: '80%' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>End Date: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'uppercase' }}>{formatDateTimeDisplay(item.end_date)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Customer: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.company_name}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Staff: </Text>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', textTransform: 'capitalize' }}>{item.staff_name}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            {hasPermissions.Add && (
                <View style={{ margin: 10 }}>
                    <MyButton btnname="Add Staff Attendance" background="#173161" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('StaffAttendance')} />
                </View>
            )}
        </View>
    )
}

export default StaffAttendancelist