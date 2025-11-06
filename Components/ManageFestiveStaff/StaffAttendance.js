import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Modal, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import Constant from '../Commoncomponent/Constant';
import Subheader from '../Commoncomponent/Subheader';
import MyButton from '../Commoncomponent/MyButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Checkbox } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';

const StaffAttendance = ({ navigation, route }) => {
    const { id, start_date, end_date, customerid } = route.params || {};
    const [mainloading, setMainloading] = useState(false);
    const [stafflist, setStafflist] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [attendancelist, setAttendancelist] = useState([]);
    const [festiveshops, setFestiveShops] = useState([]);
    const [selectedfectiveshop, setSelectedFestiveshop] = useState(customerid ? customerid : null);
    const [customerError, setCustomerError] = useState(false);

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [enddate, setEndDate] = useState(new Date());
    const [showendDatePicker, setShowEndDatePicker] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);

    const [isModaltoVisible, setIsModaltoVisible] = useState(false);
    const [selectedtoTime, setSelectedtoTime] = useState(null);
    const [existid, setExistid] = useState(id ? id : null);

    useEffect(() => {
        if (start_date) {
            const start = new Date(start_date);
            setDate(start);

            const hours = start.getHours();
            const minutes = start.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = String((hours % 12) || 12).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            setSelectedTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
        }

        if (end_date) {
            const end = new Date(end_date);
            setEndDate(end);

            const hours = end.getHours();
            const minutes = end.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = String((hours % 12) || 12).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            setSelectedtoTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
        }
    }, []);

    const generateTimes = () => {
        const times = [];
        const periods = ['AM', 'PM'];

        // Loop through periods (AM and PM)
        periods.forEach((period, i) => {
            for (let hour = 1; hour <= 12; hour++) {
                const formattedHour = hour.toString().padStart(2, '0');

                // Skip times before 8:00 AM
                if (period === 'AM' && hour < 8) continue;

                // Include 12:00 PM correctly after 11:30 AM and 12:00 AM after 11:30 PM
                const nextPeriod = i === 0 && hour === 12 ? 'PM' : i === 1 && hour === 12 ? 'AM' : period;

                times.push(`${formattedHour}:00 ${nextPeriod}`);
                times.push(`${formattedHour}:30 ${nextPeriod}`);
            }
        });

        // Now we need to add times after 12:30 AM until 7:30 AM
        for (let hour = 1; hour <= 7; hour++) {
            const formattedHour = hour.toString().padStart(2, '0');
            times.push(`${formattedHour}:00 AM`);
            times.push(`${formattedHour}:30 AM`);
        }

        return times;
    };

    const timeOptions = generateTimes();

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setIsModalVisible(false);
    };

    const handletoTimeSelect = (time) => {
        setSelectedtoTime(time);
        setIsModaltoVisible(false);
    };

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
            const formattedItems = result.payload.map((item) => ({
                label: item.company_name,
                value: item.c_id,
            }));
            setFestiveShops(formattedItems);
        } else {
            setFestiveShops([]);
            console.log('error while listing category');
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
            listattendance();
            festivecustomers();
        }, [])
    );
    const liststaff = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list_staff}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: ''
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setStafflist(result.payload);
        } else {
            setStafflist([]);
            console.log('error while listing staff');
        }
        setMainloading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            liststaff();
        }, [])
    );

    useEffect(() => {
        if (!attendancelist.length || !selectedfectiveshop) {
            setSelectedStaff([]);
            return;
        }

        const selectedDate = formatDateTimeAPI(date, selectedTime);
        const selectedendDate = formatDateTimeAPI(enddate, selectedtoTime)

        const existingAttendance = attendancelist.find(
            (item) =>
                item.start_date === selectedDate &&
                item.end_date === selectedendDate &&
                item.customer_id === selectedfectiveshop &&
                item.id === existid
        );

        if (existingAttendance) {
            const staffIds = existingAttendance.staff_id
                ? existingAttendance.staff_id.split(",")
                : [];
            setSelectedStaff(staffIds);
        } else {
            setSelectedStaff([]);
        }
    }, [date, selectedfectiveshop, attendancelist]);


    // Format date for API (yyyy-mm-dd)
    const formatDateAPI = (d) => {
        if (!d || isNaN(new Date(d))) return ''; // guard
        const dateObj = new Date(d);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const formatDateUI = (d) => {
        if (!d || isNaN(new Date(d))) return ''; // guard
        const dateObj = new Date(d);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const convertTo24Hour = (timeStr) => {
        if (!timeStr) return '';
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);

        if (modifier === 'PM' && hours !== 12) {
            hours += 12;
        } else if (modifier === 'AM' && hours === 12) {
            hours = 0;
        }

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    };

    const formatDateTimeAPI = (dateObj, timeStr) => {
        const datePart = formatDateAPI(dateObj); // existing function: YYYY-MM-DD
        const timePart = convertTo24Hour(timeStr);
        return `${datePart} ${timePart}`;
    };

    // Toggle staff selection
    const toggleStaff = (id) => {
        setSelectedStaff((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    // Mark Attendance API
    const markattendance = async () => {
        if (!selectedfectiveshop) {
            setCustomerError(true);
            return;
        } else {
            setCustomerError(false);
        }
        if (selectedStaff.length == 0) {
            return;
        }
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.staff_attendance}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: existid,
                start_date: formatDateTimeAPI(date, selectedTime),
                end_date: formatDateTimeAPI(enddate, selectedtoTime),
                staff_id: selectedStaff,
                customer_id: selectedfectiveshop
            }),
        });
        const result = await response.json();
        setMainloading(false);
        if (result.code === 200) {
            navigation.goBack();
        } else {
            console.log('Error saving attendance');
        }
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
            <Subheader headername="Add Staff Attendance" />
            <View style={{ flex: 1 }}>
                <ScrollView keyboardShouldPersistTaps='handled'>
                    {/* Date Selector */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10 }}>
                        {/* START DATE */}
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ width: '50%', marginRight: 5, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }} >
                            <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>
                                {formatDateUI(date)}
                            </Text>
                            <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#173161" />
                        </TouchableOpacity>

                        {/* START TIME */}
                        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={{ width: '50%', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'Inter-Regular', paddingLeft: 5, color: '#000' }}>
                                {/* {`${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} */}
                                {selectedTime ? selectedTime : 'HH:MM AM/PM'}
                            </Text>
                            <Image source={require('../../assets/down-arrow.png')} style={{ height: 18, width: 18, tintColor: 'gray' }} />
                        </TouchableOpacity>

                    </View>

                    {/* END DATE & TIME */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginBottom: 10 }}>
                        {/* END DATE */}
                        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={{ width: '50%', marginRight: 5, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }} >
                            <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>
                                {formatDateUI(enddate)}
                            </Text>
                            <MaterialCommunityIcons name="calendar-month-outline" size={20} color="#173161" />
                        </TouchableOpacity>

                        {/* END TIME */}
                        <TouchableOpacity onPress={() => setIsModaltoVisible(true)} style={{ width: '50%', opacity: 1, alignItems: 'center', borderColor: '#ccc', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'Inter-Regular', paddingLeft: 5, color: '#000' }}>
                                {/* {`${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`} */}
                                {selectedtoTime ? selectedtoTime : 'HH:MM AM/PM'}
                            </Text>
                            <Image source={require('../../assets/down-arrow.png')} style={{ height: 18, width: 18, tintColor: 'gray' }} />
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}

                    {showendDatePicker && (
                        <DateTimePicker
                            value={enddate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowEndDatePicker(false);
                                if (selectedDate) setEndDate(selectedDate);
                            }}
                        />
                    )}

                    <Dropdown
                        data={festiveshops}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Customer"
                        placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}
                        selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}
                        value={selectedfectiveshop}
                        onChange={item => {
                            setSelectedFestiveshop(item.value);
                            setCustomerError(false);
                        }}
                        style={{
                            height: 45,
                            borderColor: customerError ? 'red' : 'gray',
                            borderWidth: 0.5,
                            borderRadius: 8,
                            paddingHorizontal: 15,
                            marginBottom: 5,
                            marginHorizontal: 10,
                        }}
                        renderItem={item => {
                            const isSelected = item.value === selectedStaff;
                            return (
                                <View style={{ padding: 8, paddingHorizontal: 12, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>
                                        {item.label}
                                    </Text>
                                </View>
                            );
                        }}
                    />

                    {customerError && (
                        <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginHorizontal: 10, marginBottom: 5 }}>
                            Please select a customer
                        </Text>
                    )}
                    {/* Staff List */}
                    <View
                        style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            paddingHorizontal: 10,
                        }}
                    >
                        {stafflist.map((staff) => (
                            <View key={staff.staff_id} style={{ width: '48%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, margin: '1%', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, }} >
                                <Checkbox
                                    status={selectedStaff.includes(String(staff.staff_id)) ? 'checked' : 'unchecked'}
                                    onPress={() => toggleStaff(staff.staff_id)}
                                    color="#173161"
                                />
                                <Text style={{ fontSize: 14, color: '#000', flexShrink: 1 }}>
                                    {staff.staff_name}
                                </Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Time options Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                    <View style={{ width: '100%', height: '60%', backgroundColor: '#fff', borderRadius: 10, padding: 20, }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 18, color: '#000' }}>Select Time</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ marginTop: 5 }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {timeOptions.map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        padding: 15,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#eee',
                                    }}
                                    onPress={() => handleTimeSelect(time)}
                                >
                                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Time options Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModaltoVisible}
                onRequestClose={() => setIsModaltoVisible(false)}
            >
                <TouchableOpacity onPress={() => setIsModaltoVisible(false)} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', }}>
                    <View style={{ width: '100%', height: '60%', backgroundColor: '#fff', borderRadius: 10, padding: 20, }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 18, color: '#000' }}>Select Time</Text>
                            <TouchableOpacity onPress={() => setIsModaltoVisible(false)} style={{ marginTop: 5 }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {timeOptions.map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        padding: 15,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#eee',
                                    }}
                                    onPress={() => handletoTimeSelect(time)}
                                >
                                    <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            <View style={{ margin: 10 }}>
                <MyButton btnname="Save" background="#173161" fontsize={18} textcolor="#FFF" runFunc={markattendance} />
            </View>
        </View>
    )
}

export default StaffAttendance