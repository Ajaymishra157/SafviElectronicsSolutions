import { StatusBar, ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Keyboard, FlatList, ActivityIndicator, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import Subheader from '../Commoncomponent/Subheader';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';

const StaffAttendance = () => {

    // 🔹 State variables for Start & End Dates
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    console.log("start date and end Date", startDate, endDate);
    const [userId, setUserId] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [openUser, setOpenUser] = useState(false);
    const [userList, setUserList] = useState([]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);


    const COL_WIDTH = 90;
    const INFO_WIDTH = 30;


    // Format date for display
    const formatDatefordisplay = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Format date for API (YYYY-MM-DD format)
    const formatDate = (date) => {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${y}-${m}-${d}`;
    };

    const listUsers = async () => {
        console.log("listuser wali api hai", userId)
        try {
            const url = `${Constant.URL}${Constant.OtherURL.user_list}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();

            if (result.code == '200') {
                const formatted = result.payload.map(item => ({
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

    const fetchAttendanceList = async (selectedId = userId) => {
        setLoading(true);
        console.log("API ke params:", {
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            staff_id: selectedId,
            userId_state: userId
        });

        try {

            const url = `${Constant.URL}${Constant.OtherURL.list_staffattendance}`;
            const payload = {
                start_date: formatDate(startDate),
                end_date: formatDate(endDate)
            };

            // ✅ Agar specific staff select kiya hai to hi staff_id add karo
            if (selectedId !== null && selectedId !== undefined) {
                payload.staff_id = selectedId;
            }

            console.log("API payload:", payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            console.log("Attendance API response:", result);

            if (result.code === 200) {
                setAttendanceList(result.payload || []);
            } else {
                setAttendanceList([]);
            }
        } catch (error) {
            console.log('Error fetching attendance list:', error);
            setAttendanceList([]);
        } finally {
            setLoading(false);
        }
    };

    // Date picker handlers
    const onStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate); // fetch automatically useEffect se
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate); // fetch automatically useEffect se
        }
    };


    useEffect(() => {
        listUsers();

    }, []);
    useEffect(() => {
        if (userList.length > 0) {
            fetchAttendanceList(userId);
        }
    }, [userList, startDate, endDate, userId]);

    // Handle user selection
    const handleUserSelect = (selectedValue) => {
        console.log("Selected user value:", selectedValue);
        setUserId(selectedValue);
        // Fetch attendance for selected user
        fetchAttendanceList(selectedValue);
    };

    const renderAdminAttendanceItem = ({ item }) => {
        return (
            <>
                {item.dates?.map((d, i) => (
                    <View
                        key={i}
                        style={{
                            flexDirection: 'row',
                            borderWidth: 1,
                            borderTopWidth: 0,
                            borderColor: '#ddd',
                            backgroundColor: '#fff',
                        }}
                    >
                        {/* STAFF */}
                        <View style={{ width: 120, padding: 8, borderRightWidth: 1, borderColor: '#ddd' }}>
                            <Text style={{ fontSize: 12, textAlign: 'center' }}>
                                {item.staffname}
                            </Text>
                        </View>

                        {/* DATE */}
                        <View style={{ width: 120, padding: 8, borderRightWidth: 1, borderColor: '#ddd' }}>
                            <Text style={{ fontSize: 12, textAlign: 'center' }}>
                                {formatDatefordisplay(item.date)}
                            </Text>
                        </View>

                        {/* IN TIME */}
                        <View style={{ width: 120, padding: 8, borderRightWidth: 1, borderColor: '#ddd' }}>
                            <Text style={{ fontSize: 12, textAlign: 'center' }}>
                                {d.checkin || '-'}
                            </Text>
                        </View>

                        {/* IN IMAGE */}
                        <TouchableOpacity
                            style={{
                                width: 120,
                                padding: 8,
                                borderRightWidth: 1,
                                borderColor: '#ddd',
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                if (d.image) {
                                    setSelectedImage(d.image);   // ✅ STRING
                                    setModalVisible(true);
                                }
                            }}
                        >
                            <Image
                                source={d.image ? { uri: d.image } : require('../../assets/default.png')}
                                style={{ width: 40, height: 40, borderRadius: 20, opacity: d.image ? 1 : 0.4 }}
                            />
                        </TouchableOpacity>


                        {/* OUT TIME */}
                        <View style={{ width: 120, padding: 8, borderRightWidth: 1, borderColor: '#ddd' }}>
                            <Text style={{ fontSize: 12, textAlign: 'center' }}>
                                {d.checkout === '00:00:00' ? '-' : d.checkout}
                            </Text>
                        </View>

                        {/* OUT IMAGE */}
                        <TouchableOpacity
                            style={{
                                width: 120,
                                padding: 8,
                                borderRightWidth: 1,
                                borderColor: '#ddd',
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                if (d.image_punchout) {
                                    setSelectedImage(d.image_punchout); // ✅ STRING
                                    setModalVisible(true);
                                }
                            }}
                        >
                            <Image
                                source={d.image_punchout ? { uri: d.image_punchout } : require('../../assets/default.png')}
                                style={{ width: 40, height: 40, borderRadius: 20, opacity: d.image_punchout ? 1 : 0.4 }}
                            />
                        </TouchableOpacity>


                        {/* STATUS */}
                        < View style={{ width: 120, padding: 8 }}>
                            <Text
                                style={{
                                    fontSize: 12,
                                    textAlign: 'center',
                                    color: d.status === 'Present' ? 'green' : 'red',
                                }}
                            >
                                {d.status}
                            </Text>
                        </ View>
                    </View >
                ))}
            </>
        );
    };



    return (
        <View style={{ flex: 1, backgroundColor: "#F4F6FA" }}>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />
            <Subheader headername="Attendance List" />

            {/* DATE DISPLAY CARD (Read-only) */}
            <View style={{
                backgroundColor: '#F9F9F9',
                borderRadius: 12,
                padding: 16,
                margin: 15,
                marginBottom: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}>
                <Text style={{
                    fontSize: 18,
                    fontFamily: 'Inter-Bold',
                    color: '#173161',
                    marginBottom: 16,
                }}>
                    Select Date Range
                </Text>

                {/* Start Date */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'Inter-Medium',
                            color: '#666',
                            marginBottom: 8,
                        }}>
                            Start Date
                        </Text>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderWidth: 1,
                                borderColor: '#DDD',
                                borderRadius: 8,
                                padding: 12,
                                backgroundColor: '#FFF',
                            }}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text style={{
                                fontSize: 14,
                                fontFamily: 'Inter-Medium',
                                color: '#333',
                            }}>
                                {formatDatefordisplay(startDate)}
                            </Text>
                            <Image
                                source={require('../../assets/calendar.png')}
                                style={{ height: 18, width: 18, tintColor: '#173161' }}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* End Date */}
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'Inter-Medium',
                            color: '#666',
                            marginBottom: 8,
                        }}>
                            End Date
                        </Text>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderWidth: 1,
                                borderColor: '#DDD',
                                borderRadius: 8,
                                padding: 12,
                                backgroundColor: '#FFF',
                            }}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Text style={{
                                fontSize: 14,
                                fontFamily: 'Inter-Medium',
                                color: '#333',
                            }}>
                                {formatDatefordisplay(endDate)}
                            </Text>
                            <Image
                                source={require('../../assets/calendar.png')}
                                style={{ height: 18, width: 18, tintColor: '#173161' }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date Pickers */}
                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={onStartDateChange}
                        maximumDate={new Date()}
                    />
                )}

                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={onEndDateChange}
                        maximumDate={new Date()}  // aaj ke baad select nahi hoga
                        minimumDate={startDate}
                    />
                )}
            </View>

            {/* STAFF SELECTION DROPDOWN */}
            <View style={{ marginHorizontal: 15, marginBottom: 10, zIndex: openUser ? 1000 : 1 }}>
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
                    placeholder="All Staff"
                    open={openUser}
                    value={userId}
                    items={userList}
                    setOpen={setOpenUser}
                    setValue={(callback) => {
                        const newValue = callback(userId);
                        setUserId(newValue);
                    }}
                    onChangeValue={(value) => {
                        console.log("onChangeValue:", value);
                        handleUserSelect(value);
                    }}
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
                    }}
                    listMode="MODAL"
                    modalProps={{
                        animationType: "slide"
                    }}
                    modalTitle="All Staff"
                    modalContentContainerStyle={{
                        backgroundColor: '#fff'
                    }}
                />
            </View>

            {/* ATTENDANCE LIST */}

            <View style={{ flex: 1, marginTop: 10 }}>

                {/* LOADING */}
                {loading && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#173161" />
                        <Text style={{ marginTop: 10, fontSize: 16, color: '#173161' }}>
                            Loading attendance...
                        </Text>
                    </View>
                )}

                {/* EMPTY */}
                {!loading && attendanceList.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <Image
                            source={require('../../assets/staffattendance.png')}
                            style={{ width: 120, height: 120 }}
                        />
                        <Text style={{ color: 'gray', marginTop: 10 }}>
                            No attendance records found
                        </Text>
                    </View>
                )}

                {/* TABLE */}
                {!loading && attendanceList.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={{ paddingHorizontal: 15 }}>

                            {/* 🔥 HEADER */}
                            <View style={{
                                flexDirection: 'row',
                                backgroundColor: '#173161',
                                borderWidth: 1,
                                borderColor: '#ccc',
                            }}>
                                {[
                                    'Staff',
                                    'Date',
                                    'In Time',
                                    'In Image',
                                    'Out Time',
                                    'Out Image',
                                    'Status',
                                ].map((title, i) => (
                                    <View
                                        key={i}
                                        style={{
                                            width: 120,
                                            paddingVertical: 10,
                                            borderRightWidth: i === 6 ? 0 : 1,
                                            borderColor: '#ccc',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ color: '#FFF', fontSize: 12, fontFamily: 'Inter-Bold' }}>
                                            {title}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* 🔥 ROWS */}
                            <FlatList
                                data={attendanceList}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={renderAdminAttendanceItem}
                                nestedScrollEnabled={true}
                                keyboardShouldPersistTaps='handled'
                                contentContainerStyle={{ paddingBottom: 30 }}
                            />

                        </View>
                    </ScrollView>
                )}
            </View>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View
                        style={{
                            height: 260,
                            width: 260,
                            borderRadius: 130,     // 🔥 FULL CIRCLE
                            backgroundColor: "#fff",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                            elevation: 10,
                        }}
                        onStartShouldSetResponder={() => true}
                    >
                        {selectedImage ? (
                            <Image
                                source={{ uri: selectedImage }}
                                style={{
                                    height: "100%",
                                    width: "100%",
                                    borderRadius: 130,
                                }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text>No Image</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>




        </View>
    )
}

export default StaffAttendance

const styles = StyleSheet.create({})