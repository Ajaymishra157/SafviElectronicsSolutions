import { View, Text, TouchableOpacity, TextInput, Image, Keyboard, ActivityIndicator, SafeAreaView, StatusBar, Alert, ScrollView, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign'
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Constant from '../Commoncomponent/Constant';

const AddAttendance = ({ navigation }) => {
    const [location, setLocation] = useState('');
    const [userimg, setUserimg] = useState(null);
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mainloading, setMainloading] = useState(false);
    const [attendancelist, setAttendancelist] = useState([]);
    const [isOutDisabled, setIsOutDisabled] = useState(false);
    const [isInDisabled, setIsInDisabled] = useState(false);

    const [todayAttendance, setTodayAttendance] = useState(null);

    // ✅ Punch times ke liye state variables
    const [punchInTime, setPunchInTime] = useState('--:--');
    const [punchOutTime, setPunchOutTime] = useState('--:--');

    // ✅ Error states
    const [photoError, setPhotoError] = useState('');
    const [attendanceStatusError, setAttendanceStatusError] = useState('');


    const checkTodayAttendance = async () => {
        const Id = await AsyncStorage.getItem('admin_id');
        const today = new Date().toISOString().split('T')[0];

        const url = `${Constant.URL}${Constant.OtherURL.list_staffattendance}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staff_id: Id,
                    start_date: today,
                    end_date: today
                }),
            });
            const result = await response.json();
            console.log("=== TODAY'S ATTENDANCE CHECK ===");
            console.log("Full API Response:", JSON.stringify(result, null, 2));

            if (result.code === 200 && result.payload && result.payload.length > 0) {
                const todayData = result.payload[0];
                setTodayAttendance(todayData);

                console.log("Today Data:", todayData);
                console.log("Dates array:", todayData.dates);

                // ✅ Punch times set karo - LATEST record find karo
                if (todayData.dates && todayData.dates.length > 0) {
                    // ✅ Sort by entrydate descending to get latest record
                    const sortedDates = [...todayData.dates].sort((a, b) =>
                        new Date(b.entrydate) - new Date(a.entrydate)
                    );
                    const latestRecord = sortedDates[0]; // ✅ Now this is the latest record

                    console.log("Sorted Dates:", sortedDates);
                    console.log("Latest Record:", latestRecord);
                    console.log("Latest Checkout:", latestRecord.checkout);

                    setPunchInTime(latestRecord.checkin || '--:--');
                    setPunchOutTime(latestRecord.checkout !== '00:00:00' ? latestRecord.checkout : '--:--');
                }

                // ✅ Check latest record status (use the sorted one)
                const sortedDates = todayData.dates ? [...todayData.dates].sort((a, b) =>
                    new Date(b.entrydate) - new Date(a.entrydate)
                ) : [];
                const latestRecord = sortedDates[0];

                console.log("Final Logic Check:");
                console.log("Latest Record exists:", !!latestRecord);
                if (latestRecord) {
                    console.log("Checkout value:", latestRecord.checkout);
                    console.log("Checkout === '00:00:00':", latestRecord.checkout === '00:00:00');
                }

                if (latestRecord) {
                    if (latestRecord.checkout === '00:00:00') {
                        // ✅ Latest record mein check out nahi hua hai - check out enable karo
                        setIsInDisabled(true);
                        setIsOutDisabled(false);
                        setAttendanceStatus('OUT');
                        console.log("✅ FINAL: User can check out - Check In disabled, Check Out enabled");
                    } else {
                        // ✅ Latest record mein check out ho chuka hai - naya check in allow karo
                        setIsInDisabled(false);
                        setIsOutDisabled(true);
                        setAttendanceStatus('IN');
                        console.log("✅ FINAL: User can check in - Check In enabled, Check Out disabled");
                    }
                } else {
                    // ✅ No records today - check in allow karo
                    setIsInDisabled(false);
                    setIsOutDisabled(true);
                    setAttendanceStatus('IN');
                    console.log("✅ FINAL: No records - Check In enabled, Check Out disabled");
                }
            } else {
                // ✅ No attendance today - can check in
                setIsInDisabled(false);
                setIsOutDisabled(true);
                setAttendanceStatus('IN');
                setPunchInTime('--:--');
                setPunchOutTime('--:--');
                console.log("✅ FINAL: No payload - Check In enabled, Check Out disabled");
            }
        } catch (error) {
            console.log('Error checking attendance:', error);
            // Default: allow check in if error
            setIsInDisabled(false);
            setIsOutDisabled(true);
            setAttendanceStatus('IN');
            setPunchInTime('--:--');
            setPunchOutTime('--:--');
        }
    };

    const markattendance = async () => {

        // ✅ Clear previous errors
        setPhotoError('');
        setAttendanceStatusError('');


        let hasError = false;
        if (!userimg) {
            setPhotoError('Image is required');
            return;
        }
        if (!attendanceStatus) {
            setAttendanceStatusError('Please select attendance status');
            return;
        }


        if (hasError) {
            return;
        }

        setLoading(true);
        const Id = await AsyncStorage.getItem('admin_id');
        const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

        const userImageToSend = userimg ? 'data:' + userimg.mime + ';base64,' + userimg.data : null;

        const payload = {
            staff_id: Id,
            action: attendanceStatus === 'IN' ? 'checkin' : 'checkout',
            time: currentTime,
            location: location,
            image: userImageToSend
        };

        const url = `${Constant.URL}${Constant.OtherURL.add_staffattendance}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (result.code == "200") {
                ToastAndroid.show(`Successfully checked ${attendanceStatus === 'IN' ? 'in' : 'out'}!`, ToastAndroid.LONG);

                // ✅ Punch times update karo
                if (attendanceStatus === 'IN') {
                    setPunchInTime(currentTime);
                    setPunchOutTime('--:--');

                    // After check in, enable check out
                    setIsInDisabled(true);
                    setIsOutDisabled(false);
                    setAttendanceStatus('OUT');
                } else {
                    setPunchOutTime(currentTime);

                    // ✅ After check out, enable check in for next entry
                    setIsInDisabled(false);
                    setIsOutDisabled(true);
                    setAttendanceStatus('IN');
                }

                // Reset form
                setLocation('');
                setUserimg(null);
                setPhotoError('');
                setAttendanceStatusError('');


                // ✅ Refresh today's attendance data after delay
                setTimeout(() => {
                    checkTodayAttendance();
                }, 1500);
                navigation.goBack()

            } else {
                Alert.alert('Error', result.message || 'Something went wrong.');
            }
        } catch (error) {
            Alert.alert('Error', 'Network request failed.');
        }
        setLoading(false);
    };

    // Check attendance status when screen loads
    // Check attendance status when screen loads
    useFocusEffect(
        React.useCallback(() => {
            console.log("🔄 useFocusEffect triggered - checking attendance");
            checkTodayAttendance();
        }, [])
    );

    // For demo purposes - you can remove this when you have real data
    // useEffect(() => {
    //     // Set initial state - first time user will mark IN
    //     setIsInDisabled(false);
    //     setIsOutDisabled(true);
    //     setAttendanceStatus('IN');
    // }, []);

    const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const currentDate = new Date().toLocaleDateString();

    const handleOpenCamera = async () => {
        try {
            Keyboard.dismiss();
            const image = await ImagePicker.openCamera({
                width: 300,
                height: 400,
                cropping: false,
                useFrontCamera: true,
                includeBase64: true,
                compressImageQuality: 0.7,
            });
            setUserimg({
                uri: image.path,
                mime: image.mime,
                data: image.data
            });
            setPhotoError('');
        } catch (error) {
            console.log('Camera cancelled', error);
        }
    };

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        )
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#F4F6FA' }}>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />

            {/* Header */}
            <View style={{
                backgroundColor: '#173161',
                flexDirection: 'row',
                height: 50,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 15,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <AntDesign name="arrowleft" size={20} color="white" />
                </TouchableOpacity>
                <Text style={{
                    color: '#FFF',
                    fontFamily: 'Roboto-Bold',
                    fontSize: 18
                }}>
                    Add Attendance
                </Text>
                <View style={{ width: 20 }}></View>
            </View>

            <View style={{ flex: 1, backgroundColor: '#F4F6FA', padding: 20 }}>

                {/* Current Time & Date */}


                {/* Punch In/Out Times */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    backgroundColor: '#fff',
                    borderRadius: 16,
                    paddingVertical: 20,
                    marginBottom: 25,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{
                            color: '#666',
                            fontFamily: 'Roboto-Medium',
                            fontSize: 14,
                            marginBottom: 8
                        }}>
                            Punch In
                        </Text>
                        <Text style={{
                            color: '#173161',
                            fontFamily: 'Roboto-Bold',
                            fontSize: 18
                        }}>
                            {punchInTime || '--:--'}
                        </Text>
                    </View>

                    <View style={{
                        borderRightWidth: 1,
                        borderColor: '#E0E0E0',
                        height: '80%',
                        alignSelf: 'center'
                    }}></View>

                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{
                            color: '#666',
                            fontFamily: 'Roboto-Medium',
                            fontSize: 14,
                            marginBottom: 8
                        }}>
                            Punch Out
                        </Text>
                        <Text style={{
                            color: '#173161',
                            fontFamily: 'Roboto-Bold',
                            fontSize: 18
                        }}>
                            {punchOutTime || '--:--'}
                        </Text>
                    </View>
                </View>

                {/* IN/OUT Buttons */}
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: '#fff',
                    marginBottom: 20,
                    borderRadius: 12,
                    overflow: 'hidden',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                }}>
                    <TouchableOpacity
                        disabled={isInDisabled}
                        onPress={() => {
                            setAttendanceStatus('IN');
                            setAttendanceStatusError('');
                        }}
                        style={{
                            flex: 1,
                            backgroundColor: attendanceStatus == 'IN' ? '#173161' : '#f8f9fa',
                            paddingVertical: 15,
                            alignItems: 'center',
                            opacity: isInDisabled ? 0.5 : 1
                        }}
                    >
                        <Text style={{
                            color: attendanceStatus == 'IN' ? '#fff' : '#173161',
                            fontFamily: 'Roboto-Bold',
                            fontSize: 16
                        }}>
                            CHECK IN
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={isOutDisabled}
                        onPress={() => {
                            setAttendanceStatus('OUT');
                            setAttendanceStatusError('');
                        }}
                        style={{
                            flex: 1,
                            backgroundColor: attendanceStatus == 'OUT' ? '#173161' : '#f8f9fa',
                            paddingVertical: 15,
                            alignItems: 'center',
                            opacity: isOutDisabled ? 0.5 : 1
                        }}
                    >
                        <Text style={{
                            color: attendanceStatus == 'OUT' ? '#fff' : '#173161',
                            fontFamily: 'Roboto-Bold',
                            fontSize: 16
                        }}>
                            CHECK OUT
                        </Text>
                    </TouchableOpacity>
                </View>
                {attendanceStatusError ? (
                    <Text style={{
                        color: 'red',
                        fontFamily: 'Roboto-Regular',
                        fontSize: 12,
                        marginBottom: 12,
                        marginLeft: 5
                    }}>
                        {attendanceStatusError}
                    </Text>
                ) : null}

                {/* Location Input */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{
                        color: '#333',
                        fontFamily: 'Roboto-Medium',
                        fontSize: 14,
                        marginBottom: 8,
                        marginLeft: 5
                    }}>
                        Location
                    </Text>
                    <TextInput
                        placeholder="Enter your current location"
                        placeholderTextColor='#999'
                        value={location}
                        onChangeText={setLocation}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            fontSize: 16,
                            color: '#000',
                            fontFamily: 'Roboto-Regular',
                            elevation: 1,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                        }}
                    />
                </View>

                {/* Capture Photo Button */}
                <TouchableOpacity
                    onPress={handleOpenCamera}
                    style={{
                        backgroundColor: userimg ? '#e8f5e8' : '#f0f8ff',
                        borderRadius: 20,
                        padding: 25,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 20,
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        borderWidth: 2,
                        borderColor: userimg ? '#28a745' : '#173161',
                        borderStyle: 'dashed',
                    }}>
                    <View style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: userimg ? '#28a745' : '#173161',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 15,
                        elevation: 2,
                    }}>
                        <Text style={{ fontSize: 32, color: '#fff' }}>
                            {userimg ? '✅' : '📷'}
                        </Text>
                    </View>
                    <Text style={{
                        color: userimg ? '#28a745' : '#173161',
                        fontSize: 16,
                        fontWeight: '700',
                        fontFamily: 'Roboto-Bold',
                        marginBottom: 5,
                    }}>
                        {userimg ? 'Photo Captured!' : 'Tap to Capture'}
                    </Text>
                    <Text style={{
                        color: '#666',
                        fontSize: 12,
                        fontFamily: 'Roboto-Regular',
                        textAlign: 'center',
                    }}>
                        {userimg ? 'Selfie verified for attendance' : 'Take a selfie for verification'}
                    </Text>
                </TouchableOpacity>
                {photoError ? (
                    <Text style={{
                        color: 'red',
                        fontFamily: 'Roboto-Regular',
                        fontSize: 12,
                        marginBottom: 12,
                        marginLeft: 5
                    }}>
                        {photoError}
                    </Text>
                ) : null}

                {/* Photo Preview */}
                {userimg && (
                    <View style={{ marginBottom: 20, alignItems: 'center' }}>
                        <Text style={{
                            color: '#333',
                            fontFamily: 'Roboto-Medium',
                            fontSize: 14,
                            marginBottom: 10
                        }}>
                            Photo Preview:
                        </Text>
                        <Image
                            source={{ uri: userimg.uri }}
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: '#173161',
                            }}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {/* Submit Button */}
                {loading ? (
                    <View style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: 12,
                        paddingVertical: 16,
                        marginTop: 10
                    }}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                ) : (
                    <TouchableOpacity
                        disabled={!attendanceStatus} // ✅ Sirf attendanceStatus check karo
                        onPress={markattendance}
                        style={{
                            backgroundColor: !attendanceStatus ? '#ccc' : '#1a1a1a', // ✅ Sirf attendanceStatus ke hisab se color
                            paddingVertical: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            marginTop: 10,
                            elevation: 3,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                        }}
                    >
                        <Text style={{
                            color: !attendanceStatus ? '#666' : '#fff',
                            fontFamily: 'Roboto-Bold',
                            fontSize: 16
                        }}>
                            ✅ Submit Attendance
                        </Text>
                    </TouchableOpacity>
                )}

                {/* View Timesheet */}
                {/* <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 10 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Listattendance')}
                        style={{
                            paddingVertical: 12,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{
                            color: '#173161',
                            textAlign: 'center',
                            fontFamily: 'Roboto-Medium',
                            fontSize: 15,
                            textDecorationLine: 'underline'
                        }}>
                            📊 View Timesheet
                        </Text>
                    </TouchableOpacity>
                </View> */}
            </View>
        </ScrollView>
    )
}

export default AddAttendance