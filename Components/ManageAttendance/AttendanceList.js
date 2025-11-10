import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Image,
    StatusBar,
    Keyboard,
    Modal,
    ScrollView,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constant from '../Commoncomponent/Constant';

const AttendanceList = ({ navigation }) => {
    const [openUser, setOpenUser] = useState(false);
    const [userList, setUserList] = useState([]);
    const [userId, setUserId] = useState(null);
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Date filter states
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Format date to YYYY-MM-DD
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };


    // Fetch Staff
    const listUsers = async () => {
        console.log("listuser wali api hai", userId)
        try {
            const url = `${Constant.URL}${Constant.OtherURL.user_list}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            console.log(" result api hai main staff ke andar", result)
            if (result.code == '200') {
                const formatted = result.Payload.map(item => ({
                    label: item.first_name,
                    value: String(item.userid),
                }));

                // ✅ "All" option add karo
                const allOption = {
                    label: "All Staff",
                    value: null  // null value for all staff
                };

                setUserList([allOption, ...formatted]);
            } else {
                // ✅ Even if API fails, "All" option show karo
                setUserList([{
                    label: "All Staff",
                    value: null
                }]);
            }
        } catch (error) {
            console.log('Network error in listUsers:', error);
            // ✅ Network error mein bhi "All" option show karo
            setUserList([{
                label: "All Staff",
                value: null
            }]);
        }
    };

    // Fetch Attendance with date filter
    const fetchAttendanceList = async (selectedId = userId) => {
        console.log("data ke log kardo na", formatDate(startDate), formatDate(endDate), selectedId, userId)
        try {
            setLoading(true);
            const url = `${Constant.URL}${Constant.OtherURL.list_staffattendance}`;
            const payload = {
                start_date: formatDate(startDate),
                end_date: formatDate(endDate)
            };

            // ✅ Agar specific staff select kiya hai to hi staff_id add karo
            if (selectedId) {
                payload.staff_id = selectedId;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (result.code === 200) {
                setAttendanceList(result.payload);
            } else {
                setAttendanceList([]);
            }
        } catch (error) {
            console.log('Error fetching attendance list:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAttendanceList().then(() => setRefreshing(false));
    }, [userId, startDate, endDate]);

    // Apply date filter
    const applyDateFilter = () => {
        setShowDateFilter(false);
        fetchAttendanceList();

    };

    // Reset date filter
    const resetDateFilter = () => {
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);

        setStartDate(oneWeekAgo);
        setEndDate(today);
        setShowDateFilter(false);
        fetchAttendanceList();
    };

    useEffect(() => {
        listUsers();
        // Set default date range (last 7 days)
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        setStartDate(oneWeekAgo);
        setEndDate(today);
        fetchAttendanceList();
    }, []);

    useEffect(() => {
        // ✅ Har bar call karo, chahe userId null ho ya kuch bhi ho
        fetchAttendanceList(userId);
    }, [userId]);

    const renderAttendanceItem = ({ item }) => (
        <View
            style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 10,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#eee',
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
            }}
        >
            {/* Staff Info with Image */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                {item.dates?.length > 0 && item.dates[item.dates.length - 1].image ? (
                    <Image
                        source={{ uri: item.dates[item.dates.length - 1].image }}
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            marginRight: 10,
                        }}
                    />
                ) : (
                    <View
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: '#173161',
                            marginRight: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter-Bold' }}>
                            {item.staffname ? item.staffname.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter-Bold', color: '#333', fontSize: 14 }}>
                        {item.staffname || 'Unknown Staff'}
                    </Text>
                    <Text style={{ fontFamily: 'Inter-Regular', color: '#666', fontSize: 12 }}>
                        Date: {item.date}
                    </Text>
                </View>
            </View>

            {/* Attendance Records */}
            {item.dates && item.dates.map((dateItem, index) => (
                <View
                    key={index}
                    style={{
                        backgroundColor: '#f8f9fa',
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: dateItem.status === 'Present' ? '#28a745' : '#dc3545',
                    }}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontFamily: 'Inter-Medium', color: '#333', fontSize: 12 }}>
                            Check-in:
                        </Text>
                        <Text style={{ fontFamily: 'Inter-Regular', color: '#000', fontSize: 12 }}>
                            {dateItem.checkin}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontFamily: 'Inter-Medium', color: '#333', fontSize: 12 }}>
                            Check-out:
                        </Text>
                        <Text style={{ fontFamily: 'Inter-Regular', color: '#000', fontSize: 12 }}>
                            {dateItem.checkout === '00:00:00' ? 'Not Checked Out' : dateItem.checkout}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontFamily: 'Inter-Medium', color: '#333', fontSize: 12 }}>
                            Status:
                        </Text>
                        <Text
                            style={{
                                fontFamily: 'Inter-Regular',
                                color: dateItem.status === 'Present' ? 'green' : 'red',
                                fontSize: 12,
                            }}
                        >
                            {dateItem.status}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontFamily: 'Inter-Medium', color: '#333', fontSize: 10 }}>
                            Recorded:
                        </Text>
                        <Text style={{ fontFamily: 'Inter-Regular', color: '#666', fontSize: 10 }}>
                            {dateItem.entrydate}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F4F6FA' }}>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />

            {/* Header */}
            <View
                style={{
                    backgroundColor: '#173161',
                    flexDirection: 'row',
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 10,
                }}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../../assets/arrow_back.png')}
                        style={{ height: 25, width: 25, tintColor: '#FFF' }}
                    />
                </TouchableOpacity>
                <Text
                    numberOfLines={1}
                    style={{
                        color: '#FFF',
                        fontFamily: 'Inter-Bold',
                        fontSize: 16,
                    }}
                >
                    List Attendance
                </Text>
                <TouchableOpacity onPress={() => setShowDateFilter(true)}>
                    <Image
                        source={require('../../assets/filter.png')} // Add filter icon
                        style={{ height: 20, width: 20, tintColor: '#FFF' }}
                    />
                </TouchableOpacity>
            </View>

            {/* Date Filter Display */}
            <View style={{ paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#666' }}>
                    {formatDate(startDate)} to {formatDate(endDate)}
                </Text>
                <TouchableOpacity onPress={() => setShowDateFilter(true)}>
                    <Text style={{ fontFamily: 'Inter-Medium', fontSize: 12, color: '#173161' }}>
                        Change Dates
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Staff Dropdown */}
            {/* <View style={{ margin: 15, zIndex: openUser ? 10 : 1 }}>
                <Text
                    style={{
                        color: 'gray',
                        fontFamily: 'Inter-Regular',
                        fontSize: 12,
                        marginLeft: 5,
                        marginBottom: 5,
                    }}
                >
                    Select Staff
                </Text>
                <DropDownPicker
                    placeholder="Select Staff"
                    open={openUser}
                    value={userId}
                    items={userList}
                    setOpen={(isOpen) => {
                        setOpenUser(isOpen);
                        if (isOpen) Keyboard.dismiss();
                    }}
                    setValue={setUserId}
                    searchable={true}
                    searchablePlaceholder="Search staff..."
                    searchContainerStyle={{
                        borderBottomColor: '#dfdfdf',
                        borderBottomWidth: 1,
                    }}
                    searchTextInputStyle={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 14,
                        color: '#000',
                    }}
                    style={{
                        height: 40,
                        borderRadius: 10,
                        borderColor: 'gray',
                        backgroundColor: '#F5F5F5',
                    }}
                    textStyle={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: '#000',
                    }}
                    dropDownContainerStyle={{
                        borderColor: '#CCC',
                        backgroundColor: '#fff',
                        elevation: 3,
                        alignSelf: 'center',
                    }}
                    listMode="MODAL"
                />
            </View> */}

            {/* Attendance List */}
            {loading ? (
                <ActivityIndicator size="large" color="#173161" style={{ marginTop: 30 }} />
            ) : (
                <FlatList
                    data={attendanceList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderAttendanceItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <Text
                            style={{
                                textAlign: 'center',
                                color: 'gray',
                                marginTop: 50,
                                fontFamily: 'Inter-Regular',
                            }}
                        >
                            No attendance records found for selected dates.
                        </Text>
                    }
                    contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 80 }}
                />
            )}

            {/* Add Attendance Button */}
            <View style={{
                position: 'absolute',
                bottom: 15,
                alignSelf: 'center',
                zIndex: 10,
            }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('AddAttendance')}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a326e',
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 25,
                        elevation: 6,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowOffset: { width: 0, height: 3 },
                        shadowRadius: 4,
                    }}
                >
                    <Image
                        source={require('../../assets/checking-attendance.png')}
                        style={{
                            height: 20,
                            width: 20,
                            tintColor: '#fff',
                            marginRight: 8,
                        }}
                    />
                    <Text style={{
                        color: '#fff',
                        fontSize: 16,
                        fontFamily: 'Inter-SemiBold',
                    }}>
                        Add Attendance
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Date Filter Modal */}
            <Modal
                visible={showDateFilter}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDateFilter(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 15, padding: 20 }}>
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
                            Filter by Date
                        </Text>

                        {/* Start Date */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontFamily: 'Inter-Medium', marginBottom: 8, color: '#333' }}>
                                Start Date
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowStartDatePicker(true)}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 8,
                                    padding: 12,
                                    backgroundColor: '#f9f9f9',
                                }}
                            >
                                <Text style={{ fontFamily: 'Inter-Regular' }}>
                                    {formatDate(startDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* End Date */}
                        <View style={{ marginBottom: 30 }}>
                            <Text style={{ fontFamily: 'Inter-Medium', marginBottom: 8, color: '#333' }}>
                                End Date
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowEndDatePicker(true)}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    borderRadius: 8,
                                    padding: 12,
                                    backgroundColor: '#f9f9f9',
                                }}
                            >
                                <Text style={{ fontFamily: 'Inter-Regular' }}>
                                    {formatDate(endDate)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date Pickers */}
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowStartDatePicker(false);
                                    if (selectedDate) {
                                        setStartDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowEndDatePicker(false);
                                    if (selectedDate) {
                                        setEndDate(selectedDate);
                                    }
                                }}
                            />
                        )}

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                onPress={resetDateFilter}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    backgroundColor: '#6c757d',
                                    borderRadius: 8,
                                    marginRight: 10,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: 'white', fontFamily: 'Inter-Medium' }}>
                                    Reset
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={applyDateFilter}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    backgroundColor: '#173161',
                                    borderRadius: 8,
                                    marginLeft: 10,
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: 'white', fontFamily: 'Inter-Medium' }}>
                                    Apply Filter
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AttendanceList;