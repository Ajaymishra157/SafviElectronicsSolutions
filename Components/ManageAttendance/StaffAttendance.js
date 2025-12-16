import { StatusBar, StyleSheet, Text, View, TouchableOpacity, Image, Keyboard, FlatList, ActivityIndicator, Modal } from 'react-native'
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


    // Format date for display
    const formatDisplayDate = (date) => {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
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
                                {formatDisplayDate(startDate)}
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
                                {formatDisplayDate(endDate)}
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

            <View style={{ flex: 1, paddingHorizontal: 15, marginTop: 10 }}>

                {/* LOADING STATE */}
                {loading && (
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingTop: 40
                    }}>
                        <ActivityIndicator size="large" color="#173161" />
                        <Text style={{
                            marginTop: 10,
                            fontFamily: 'Inter-Medium',
                            fontSize: 16,
                            color: '#173161'
                        }}>
                            Loading attendance...
                        </Text>
                    </View>
                )}

                {/* EMPTY STATE */}
                {!loading && attendanceList.length === 0 && (
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingTop: 40
                    }}>
                        <Image
                            source={require('../../assets/staffattendance.png')}
                            style={{ height: 100, width: 100 }}
                        />
                        <Text style={{
                            fontFamily: 'Inter-Medium',
                            fontSize: 16,
                            color: 'gray'
                        }}>
                            No attendance found
                        </Text>
                    </View>
                )}

                {/* LIST VIEW */}
                {!loading && attendanceList.length > 0 && (
                    <FlatList
                        data={attendanceList}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    backgroundColor: "#FFF",
                                    marginBottom: 15,
                                    borderRadius: 10,
                                    padding: 12,
                                    shadowColor: "#000",
                                    shadowOpacity: 0.1,
                                    shadowOffset: { width: 0, height: 2 },
                                    elevation: 2,
                                }}
                            >
                                {/* Staff Name */}
                                <Text style={{
                                    fontSize: 16,
                                    fontFamily: 'Inter-Bold',
                                    color: '#173161',
                                    marginBottom: 5,
                                }}>
                                    {item.staffname}
                                </Text>

                                {/* Date */}
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontFamily: 'Inter-Medium',
                                        color: 'gray',
                                        marginBottom: 10
                                    }}
                                >
                                    {(() => {
                                        const d = new Date(item.date);
                                        const day = String(d.getDate()).padStart(2, '0');
                                        const month = String(d.getMonth() + 1).padStart(2, '0');
                                        const year = d.getFullYear();
                                        return `${day}-${month}-${year}`;
                                    })()}
                                </Text>


                                {/* TABLE HEADER */}
                                <View style={{
                                    flexDirection: 'row',
                                    backgroundColor: '#173161',
                                    paddingVertical: 8,
                                    paddingHorizontal: 5,
                                    borderRadius: 6
                                }}>
                                    <Text style={{
                                        flex: 1,
                                        fontSize: 13,
                                        fontFamily: 'Inter-Bold',
                                        color: "#FFF",
                                        textAlign: "center",
                                    }}>Check-In</Text>

                                    <Text style={{
                                        flex: 1,
                                        fontSize: 13,
                                        fontFamily: 'Inter-Bold',
                                        color: "#FFF",
                                        textAlign: "center",
                                    }}>Check-Out</Text>

                                    <Text style={{
                                        flex: 1,
                                        fontSize: 13,
                                        fontFamily: 'Inter-Bold',
                                        color: "#FFF",
                                        textAlign: "center",
                                    }}>Status</Text>
                                </View>

                                {/* TABLE ROWS */}
                                {item.dates?.map((d, i) => {
                                    const isLast = i === item.dates.length - 1;

                                    return (
                                        <View
                                            key={i}
                                            style={{
                                                flexDirection: 'row',
                                                paddingVertical: 10,
                                                borderBottomWidth: 0.7,
                                                borderColor: '#EEE',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Text style={{
                                                flex: 1,
                                                fontSize: 14,
                                                fontFamily: 'Inter-Medium',
                                                color: "#333",
                                                textAlign: "center",
                                            }}>
                                                {d.checkin || "-"}
                                            </Text>

                                            <Text style={{
                                                flex: 1,
                                                fontSize: 14,
                                                fontFamily: 'Inter-Medium',
                                                color: "#333",
                                                textAlign: "center",
                                            }}>
                                                {d.checkout || "-"}
                                            </Text>

                                            <Text style={{
                                                flex: 1,
                                                fontSize: 14,
                                                fontFamily: 'Inter-Medium',
                                                color: d.status === "Present" ? "green" : "red",
                                                textAlign: "center",
                                            }}>
                                                {d.status || "-"}
                                            </Text>

                                            {isLast ? (
                                                <TouchableOpacity
                                                    style={{ padding: 5 }}
                                                    onPress={() => {
                                                        setSelectedImage(d.image || null);
                                                        setModalVisible(true);
                                                    }}
                                                >
                                                    <Icon name="info-circle" size={18} color="#173161" />
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={{ width: 28 }} />   // empty space for alignment
                                            )}
                                        </View>
                                    )
                                })}



                                {/* PHOTO */}
                                {/* {item.dates && item.dates[0]?.image ? (
                                    <Image
                                        source={{ uri: item.dates[0].image }}
                                        style={{
                                            height: 120,
                                            width: "100%",
                                            marginTop: 10,
                                            borderRadius: 10
                                        }}
                                        resizeMode="cover"
                                    />
                                ) : null} */}
                            </View>
                        )}
                    />
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
                        backgroundColor: "rgba(0,0,0,0.6)",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 20,
                    }}
                    activeOpacity={1}
                    onPress={() => {
                        setModalVisible(false);
                    }}

                >
                    <View
                        style={{
                            width: "90%",
                            backgroundColor: "#FFF",
                            borderRadius: 12,
                            padding: 15,
                            elevation: 10,
                        }}
                        onStartShouldSetResponder={(e) => e.stopPropagation()}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontFamily: "Inter-Bold",
                                textAlign: "center",
                                marginBottom: 10,
                            }}
                        >
                            Attendance Image
                        </Text>

                        {selectedImage ? (
                            <Image
                                source={{ uri: selectedImage }}
                                style={{
                                    height: 300,
                                    width: "100%",
                                    borderRadius: 10,
                                    backgroundColor: "#EEE",
                                }}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text
                                style={{
                                    fontFamily: "Inter-Medium",
                                    fontSize: 14,
                                    textAlign: "center",
                                    paddingVertical: 20,
                                }}
                            >
                                No Image Available
                            </Text>
                        )}

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{
                                backgroundColor: "#173161",
                                paddingVertical: 12,
                                borderRadius: 10,
                                marginTop: 15,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#FFF",
                                    fontSize: 16,
                                    fontFamily: "Inter-Bold",
                                    textAlign: "center",
                                }}
                            >
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>



        </View>
    )
}

export default StaffAttendance

const styles = StyleSheet.create({})