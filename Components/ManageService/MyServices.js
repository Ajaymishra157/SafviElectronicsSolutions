import { Image, StatusBar, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, ActivityIndicator, ToastAndroid, Alert } from 'react-native'
import React, { useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { FlatList } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constant from '../Commoncomponent/Constant';



const MyServices = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [code, setCode] = useState('');
    const [note, setNote] = useState('');
    const [showNoteField, setShowNoteField] = useState(false);
    const [selectedAction, setSelectedAction] = useState('');
    const [services, setServices] = useState([
    ]);
    const [codeError, setCodeError] = useState('');

    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);


    const listMyServices = async () => {
        try {
            setLoading(true);

            const StaffId = await AsyncStorage.getItem('admin_id');


            const url = `${Constant.URL}${Constant.OtherURL.staff_wise_service}`;// replace with actual endpoint
            const payload = {
                staff_id: StaffId
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),

            });

            const result = await response.json();

            if (result.code == 200 && result.payload?.length > 0) {
                setServices(result.payload);
            } else {
                setServices([]);
            }
        } catch (error) {
            console.log('Error fetching service list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (action) => {

        if (!selectedItem) return;

        console.log("service id ye hai", selectedItem.service_id);

        try {
            setLoading(true);

            // ---------------------------------
            // 1️⃣ First API ALWAYS runs
            // ---------------------------------
            const payload = {
                service_id: selectedItem.service_id,
                action: action,
                note: action === 'Cancel' ? note : ""
            };

            console.log('📤 First API payload:', payload);

            const response = await fetch(`${Constant.URL}${Constant.OtherURL.status_update}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('📥 First API response:', result);

            if (result.code !== 200) {
                console.log(result.message || 'Failed to update status');
                return;
            }

            // -------------------------
            // 2️⃣ Cancel → yahi end
            // -------------------------
            if (action === "Cancel") {
                ToastAndroid.show(
                    "Service Cancelled Successfully",
                    ToastAndroid.SHORT
                );
            }

            // -------------------------
            // 3️⃣ Complete → WAIT for code
            // -------------------------
            else if (action === "Complete") {

                // Yahan serviceman ko code input dikhaya jayega
                ToastAndroid.show(
                    "Code sent to customer, please wait",
                    ToastAndroid.SHORT
                );

                return;
            }

            // Update list UI
            setServices(prevServices =>
                prevServices.map(service =>
                    service.service_id === selectedItem.service_id
                        ? { ...service, service_status: action }
                        : service
                )
            );

            // Close modal
            setStatusModalVisible(false);
            setNote('');
            setSelectedAction('');

        } catch (error) {
            console.log("❌ Error updating service:", error);
        } finally {
            setLoading(false);
        }
    };

    const openDetailsModal = async (item) => {
        setSelectedServiceDetails(item);
        setDetailsModalVisible(true);
    };


    const submitCode = async () => {
        try {
            setLoading(true);
            setCodeError('');

            const payload = {
                service_id: selectedItem.service_id,
                status_code: code
            };

            console.log("📤 Second API Payload:", payload);

            const response = await fetch(`${Constant.URL}${Constant.OtherURL.verify_code}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log("📥 Second API response:", result);

            if (result.code === 200) {
                ToastAndroid.show(
                    "Service marked as Completed",
                    ToastAndroid.SHORT
                );

                // ✅ Success par modal close karo aur state update karo
                setStatusModalVisible(false);
                setCode('');

                // ✅ Service list refresh karo ya local state update karo
                setServices(prevServices =>
                    prevServices.map(service =>
                        service.service_id === selectedItem.service_id
                            ? { ...service, service_status: 'Complete' }
                            : service
                    )
                );

            } else if (result.code === 400) {
                // ✅ 400 error - Invalid code
                setCodeError("Invalid code does not match Happy or Unhappy code");
                setCode(''); // clear input
            } else {
                // ✅ Other errors

                ToastAndroid.show(result.message || "Failed to complete service. Please try again.", ToastAndroid.SHORT);
            }

        } catch (error) {
            console.log("❌ Second API error:", error);
            Alert.alert("Network Error", "Failed to connect to server. Please check your internet connection.", [{ text: "OK" }]);
        } finally {
            setLoading(false);
        }
    };


    const handleCancelNote = () => {
        setShowNoteField(false);
        setNote('');
        setSelectedAction('');
    };

    useFocusEffect(
        React.useCallback(() => {

            listMyServices();
        }, [])
    );

    // 🧭 Fix: Adjust modal position accurately
    const openModal = (item, x, y) => {
        setSelectedItem(item);

        setModalPosition({ top: y - 15, left: x - 150 });

        setModalVisible(true);
    };

    const handleEdit = () => {
        setModalVisible(false);

    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        let hours = date.getHours();
        let minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;

        return `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`;
    };

    const openStatusModal = () => {
        setModalVisible(false);
        setStatusModalVisible(true);
        setCode('');
        // setHappyCode('');
        // setUnhappyCode('');
    };

    const renderItem = ({ item, index }) => (
        <View
            style={{
                backgroundColor: '#FFF',
                marginHorizontal: 10,
                marginVertical: 3,
                borderRadius: 10,
                padding: 12,
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 2 },
                position: 'relative',
            }}
        >
            {/* Three Dots - Absolute Right Top */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    padding: 8,
                    zIndex: 10,
                    opacity: item.service_status !== 'Pending' ? 0.3 : 1
                }}
                disabled={item.service_status !== 'Pending'}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={(e) => {
                    if (item.service_status !== 'Pending') return;
                    const { pageX, pageY } = e.nativeEvent;
                    openModal(item, pageX, pageY);
                }}
            >
                <Image
                    source={require('../../assets/threedot.png')}
                    style={{
                        height: 20,
                        width: 20,
                        tintColor: item.service_status !== 'Pending' ? '#999' : '#173161',
                    }}
                />
            </TouchableOpacity>

            {/* Eye Icon */}
            <TouchableOpacity
                onPress={() => openDetailsModal(item)}
                style={{
                    position: 'absolute',
                    top: 40, // three dot ke neeche
                    right: 14,
                    padding: 6,
                    zIndex: 18,
                }}
            >
                <Ionicons name="eye-outline" size={20} color="#173161" />
            </TouchableOpacity>

            {/* Label + Value Rows */}
            {[
                { label: 'Party Name', value: item.customer_name },
                { label: 'Service Title', value: item.service_name },
                { label: 'Amount', value: `₹${item.service_amount}` },
                {
                    label: 'Status',
                    value: item.service_status,
                    color:
                        item.service_status === 'Pending'
                            ? 'orange'
                            : item.service_status === 'Complete'
                                ? 'green'
                                : 'red',
                },
                { label: 'Created On', value: formatDateOnly(item.entry_date) },
                { label: 'Created By', value: item.added_by_user || 'Not Assign' },
            ].map((row, i) => (
                <View
                    key={i}
                    style={{
                        flexDirection: 'row',
                        marginTop: i === 0 ? 0 : 4,
                        alignItems: 'flex-start',
                    }}
                >
                    <Text
                        style={{
                            width: 110,
                            fontSize: 14,
                            color: '#777',
                            fontFamily: 'Inter-Medium',
                        }}
                    >
                        {row.label} :
                    </Text>

                    <Text
                        style={{
                            flex: 1,
                            fontSize: 14,
                            color: row.color || '#000',
                            fontFamily: 'Inter-SemiBold',
                            flexWrap: 'wrap',
                            lineHeight: 20,
                        }}
                    >
                        {row.value}
                    </Text>
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
                    My Services
                </Text>
                <Text
                    style={{
                        color: '#173161',
                        fontFamily: 'Inter-Regular',
                        fontSize: 18,
                    }}
                >
                    ..
                </Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#173161" />
                </View>
            ) : services.length > 0 ? (
                <FlatList
                    data={services}
                    keyExtractor={(item) => item.service_id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
                />
            ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                    <Image
                        source={require('../../assets/service.png')}
                        style={{ width: 120, height: 120, resizeMode: 'contain', marginBottom: 15, tintColor: '#173161' }}
                    />
                    <Text
                        style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 14,
                            color: '#173161',
                        }}
                    >
                        No Service Found
                    </Text>
                </View>
            )}

            {/* Three Dot Menu Modal */}
            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <View style={{
                        position: 'absolute',
                        top: modalPosition.top,
                        left: modalPosition.left,
                        backgroundColor: '#fff',
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        borderRadius: 8,
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                    }}>
                        <TouchableOpacity
                            onPress={openStatusModal}
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                        >
                            <Ionicons name="refresh-circle-outline" size={20} color="#173161" />
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: '#173161', marginLeft: 8 }}>
                                Change Status
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Status Change Modal */}
            {/* Status Change Modal */}
            <Modal visible={statusModalVisible} transparent={true} animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '85%' }}>
                        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#173161', marginBottom: 15, textAlign: 'center' }}>
                            Update Service Status
                        </Text>

                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: '#333', marginBottom: 5 }}>
                            Service: {selectedItem?.service_name}
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#666', marginBottom: 15 }}>
                            Customer: {selectedItem?.customer_name}
                        </Text>

                        {/* Complete Status - Status Code Input */}
                        {selectedAction === 'Complete' && (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: '#333', marginBottom: 5 }}>
                                    Enter Status Code
                                </Text>
                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: codeError ? 'red' : '#ddd',
                                        borderRadius: 8,
                                        padding: 12,
                                        fontSize: 16,
                                        backgroundColor: '#f9f9f9',
                                        textAlign: 'center',
                                        color: 'black',
                                        fontFamily: 'Inter-Regular'
                                    }}
                                    placeholder="Enter status code"
                                    placeholderTextColor='#ccc'
                                    value={code}
                                    onChangeText={(text) => {
                                        setCode(text);
                                        setCodeError(''); // clear error on typing
                                    }}
                                    keyboardType="numeric"
                                    maxLength={4}
                                />
                                {codeError ? (
                                    <Text style={{ color: 'red', fontSize: 12, marginTop: 4, fontFamily: 'Inter-Regular' }}>
                                        {codeError}
                                    </Text>
                                ) : null}
                            </View>
                        )}

                        {/* Cancel Status - Note Input */}
                        {selectedAction === 'Cancel' && (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: '#333', marginBottom: 5 }}>
                                    Reason for Cancellation *
                                </Text>
                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#ddd',
                                        borderRadius: 8,
                                        padding: 12,
                                        fontSize: 14,
                                        backgroundColor: '#f9f9f9',
                                        color: 'black',
                                        fontFamily: 'Inter-Regular',
                                        minHeight: 80,
                                        textAlignVertical: 'top'
                                    }}
                                    placeholder="Enter reason for cancellation..."
                                    placeholderTextColor='#ccc'
                                    value={note}
                                    onChangeText={setNote}
                                    multiline={true}
                                    numberOfLines={4}
                                />
                            </View>
                        )}

                        {/* Action Selection Buttons - Show when no action selected */}
                        {!selectedAction && (
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: '#333', marginBottom: 10, textAlign: 'center' }}>
                                    Select Action
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity
                                        onPress={async () => {

                                            setSelectedAction('Complete');
                                            await handleStatusChange('Complete');
                                        }
                                        }
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#4CAF50',
                                            padding: 12,
                                            borderRadius: 8,
                                            marginRight: 8,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{ fontFamily: 'Inter-Medium', color: '#fff' }}>Complete</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setSelectedAction('Cancel')}
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#f44336',
                                            padding: 12,
                                            borderRadius: 8,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{ fontFamily: 'Inter-Medium', color: '#fff' }}>Cancel Service</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {selectedAction ? (
                                // When action is selected
                                <>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedAction('');
                                            setCode('');
                                            setNote('');
                                        }}
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#f0f0f0',
                                            padding: 12,
                                            borderRadius: 8,
                                            marginRight: 8,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{ fontFamily: 'Inter-Medium', color: '#333' }}>Back</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            if (selectedAction === 'Complete') {
                                                submitCode();   // <-- yahan dusri API chalegi
                                            } else {
                                                handleStatusChange(selectedAction);
                                            }
                                        }}
                                        disabled={
                                            (selectedAction === 'Complete' && !code.trim()) ||
                                            (selectedAction === 'Cancel' && !note.trim())
                                        }
                                        style={{
                                            flex: 2,
                                            backgroundColor:
                                                (selectedAction === 'Complete' && !code.trim()) ||
                                                    (selectedAction === 'Cancel' && !note.trim())
                                                    ? '#ccc'
                                                    : selectedAction === 'Complete' ? '#4CAF50' : '#f44336',
                                            padding: 12,
                                            borderRadius: 8,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{ fontFamily: 'Inter-Medium', color: '#fff' }}>
                                            {selectedAction === 'Complete' ? 'Submit Complete' : 'Confirm Cancel'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                // When no action selected - Close modal only
                                <TouchableOpacity
                                    onPress={() => setStatusModalVisible(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#f0f0f0',
                                        padding: 12,
                                        borderRadius: 8,
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{ fontFamily: 'Inter-Medium', color: '#333' }}>Close</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Service Details Modal */}
            <Modal
                visible={detailsModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                <TouchableOpacity style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
                    activeOpacity={1}
                    onPress={() => {
                        setDetailsModalVisible(false);
                    }}>
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 20,
                        width: '90%',
                        maxWidth: 400,
                        maxHeight: '80%',
                    }}
                        onStartShouldSetResponder={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 20,
                            paddingBottom: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f0f0f0'
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'Inter-Bold',
                                color: '#173161',
                            }}>
                                Service Details
                            </Text>
                            {/* <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity> */}
                        </View>

                        {detailsLoading ? (
                            <View style={{ alignItems: 'center', padding: 20 }}>
                                <ActivityIndicator size="large" color="#173161" />
                                <Text style={{ marginTop: 10, color: '#666' }}>Loading details...</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Service Basic Info */}
                                <View style={{ marginBottom: 20 }}>
                                    {/* Customer */}
                                    <View style={{
                                        flexDirection: 'row',
                                        marginBottom: 8,
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Medium',
                                            color: '#666',
                                            width: '35%',


                                        }}>
                                            Party Name:
                                        </Text>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Bold',
                                            color: '#333',
                                            width: '65%',
                                            flexWrap: 'wrap', textAlign: 'right'
                                        }}>
                                            {selectedServiceDetails?.customer_name}
                                        </Text>
                                    </View>
                                    {/* Service Name */}
                                    <View style={{
                                        flexDirection: 'row',
                                        marginBottom: 8,
                                        alignItems: 'flex-start'
                                    }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Medium',
                                            color: '#666',
                                            width: '35%' // Label width
                                        }}>
                                            Service Title:
                                        </Text>
                                        <Text style={{
                                            fontSize: 16,
                                            fontFamily: 'Inter-Bold',
                                            color: '#333',
                                            width: '65%', // Value width
                                            flexWrap: 'wrap',
                                            textAlign: 'right'
                                        }}>
                                            {selectedServiceDetails?.service_name}
                                        </Text>
                                    </View>

                                    {/* Amount */}
                                    <View style={{
                                        flexDirection: 'row',
                                        marginBottom: 8,
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Medium',
                                            color: '#666',
                                            width: '35%'
                                        }}>
                                            Amount:
                                        </Text>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Bold',
                                            color: '#333',
                                            width: '65%',
                                            textAlign: 'right'
                                        }}>
                                            ₹{selectedServiceDetails?.service_amount}
                                        </Text>
                                    </View>

                                    {/* Status */}
                                    <View style={{
                                        flexDirection: 'row',
                                        marginBottom: 8,
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Medium',
                                            color: '#666',
                                            width: '35%'
                                        }}>
                                            Status:
                                        </Text>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Bold',
                                            color: selectedServiceDetails?.service_status === 'Complete' ? 'green' :
                                                selectedServiceDetails?.service_status === 'Cancel' ? 'red' : 'orange',
                                            width: '65%',
                                            textAlign: 'right'
                                        }}>
                                            {selectedServiceDetails?.service_status}
                                        </Text>
                                    </View>
                                    {/* <View style={{
                                        flexDirection: 'row',
                                        marginBottom: 8,
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Medium',
                                            color: '#666',
                                            width: '35%',


                                        }}>
                                            Staff Name:
                                        </Text>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'Inter-Bold',
                                            color: '#333',
                                            width: '65%',
                                            flexWrap: 'wrap', textAlign: 'right'
                                        }}>
                                            {selectedServiceDetails?.staff_name}
                                        </Text>
                                    </View> */}
                                </View>

                                {/* Lead Information */}
                                <View style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: 15,
                                    borderRadius: 12,
                                    marginBottom: 20,
                                }}>
                                    <Text style={{
                                        fontSize: 16,
                                        fontFamily: 'Inter-Bold',
                                        color: '#173161',
                                        marginBottom: 12,
                                    }}>
                                        Service Information
                                    </Text>

                                    <View style={{ gap: 15 }}>

                                        {/* Created Info */}
                                        <View>
                                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium', color: '#666', marginBottom: 4 }}>
                                                Created By
                                            </Text>
                                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#333' }}>
                                                {selectedServiceDetails?.added_by_user || 'Admin'}
                                            </Text>

                                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#999' }}>
                                                Status: <Text style={{ fontFamily: 'Inter-Regular', color: 'orange' }}>Pending</Text>
                                            </Text>

                                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#999' }}>
                                                {selectedServiceDetails?.entry_date ? formatDateOnly(selectedServiceDetails.entry_date) : 'N/A'}
                                            </Text>
                                        </View>

                                        {/* Completed / Cancelled */}
                                        {selectedServiceDetails?.service_status !== 'Pending' && (
                                            <View>
                                                <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium', color: '#666', marginBottom: 4 }}>
                                                    {selectedServiceDetails?.service_status === 'Complete' ? "Completed By" : "Cancelled By"}
                                                </Text>

                                                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#333' }}>
                                                    {selectedServiceDetails?.staff_name || 'Service Man'}
                                                </Text>

                                                <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#999' }}>
                                                    Status:{" "}
                                                    <Text
                                                        style={{
                                                            color:
                                                                selectedServiceDetails?.service_status === 'Complete'
                                                                    ? 'green'
                                                                    : selectedServiceDetails?.service_status === 'Cancel'
                                                                        ? 'red'
                                                                        : '#999',
                                                            fontFamily: 'Inter-Bold'
                                                        }}
                                                    >
                                                        {selectedServiceDetails?.service_status}
                                                    </Text>
                                                </Text>


                                                <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: '#999' }}>
                                                    {selectedServiceDetails?.complete_date ? formatDateOnly(selectedServiceDetails.complete_date) : 'N/A'}
                                                </Text>
                                            </View>
                                        )}

                                    </View>
                                </View>



                            </ScrollView>
                        )}

                        {/* Close Button */}
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#173161',
                                paddingVertical: 10,
                                borderRadius: 8,
                                alignItems: 'center',

                            }}
                            onPress={() => setDetailsModalVisible(false)}
                        >
                            <Text style={{
                                fontSize: 14,
                                fontFamily: 'Inter-Bold',
                                color: '#fff',
                            }}>
                                CLOSE
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default MyServices

const styles = StyleSheet.create({})