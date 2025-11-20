import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, ActivityIndicator, ToastAndroid, Alert } from 'react-native'
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

            // API call to update service status
            const payload = {
                service_id: selectedItem.service_id,
                action: action,
                note: action === 'Cancel' ? note : "" // Note sirf cancel ke liye
            };

            // Agar Complete hai to status_code bhi bhejo
            if (action === 'Complete') {
                payload.status_code = code;
            }

            console.log('📤 Updating service status:', payload);

            const response = await fetch(`${Constant.URL}${Constant.OtherURL.status_update}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('📥 Update status response:', result);

            if (result.code === 200) {
                ToastAndroid.show(`Service status updated to ${action}`, ToastAndroid.SHORT);

                // Update local state
                setServices(prevServices =>
                    prevServices.map(service =>
                        service.service_id === selectedItem.service_id
                            ? {
                                ...service,
                                service_status: action
                            }
                            : service
                    )
                );
            } else {
                console.log(result.message || 'Failed to update service status');
            }

            // Reset modal state
            setStatusModalVisible(false);
            setCode('');
            setNote('');
            setSelectedAction('');

        } catch (error) {
            console.log('❌ Error updating service status:', error);

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
        return `${day}/${month}/${year}`;
    };

    const openStatusModal = () => {
        setModalVisible(false);
        setStatusModalVisible(true);
        setCode('');
        // setHappyCode('');
        // setUnhappyCode('');
    };

    const renderItem = ({ item }) => (
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
                marginBottom: 5,

                position: 'relative',
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <View>
                    <Text
                        style={{
                            fontSize: 16,
                            fontFamily: 'Inter-Bold',
                            color: '#173161',
                            flex: 1,
                            textTransform: 'capitalize'
                        }}
                    >
                        {item.service_name}
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            fontFamily: 'Inter-Regular',
                            color: '#173161',
                            flex: 1,
                            textTransform: 'capitalize'
                        }}
                    >
                        {item.customer_name}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={(e) => {
                        const { pageX, pageY } = e.nativeEvent;
                        openModal(item, pageX, pageY);
                    }}
                >
                    <Image
                        source={require('../../assets/threedot.png')}
                        style={{
                            height: 20,
                            width: 20,
                            tintColor: '#173161',
                        }}
                    />
                </TouchableOpacity>
            </View>

            <Text
                style={{
                    fontSize: 14,
                    color: '#444',
                    marginTop: 3,
                    fontFamily: 'Inter-Regular',
                }}
            >
                Amount: ₹{item.service_amount}
            </Text>
            <Text
                style={{
                    fontSize: 13,
                    color: '#777',
                    marginTop: 2,
                    fontFamily: 'Inter-Regular',
                }}
            >
                Status:{' '}
                <Text
                    style={{
                        color:
                            item.service_status === 'Pending'
                                ? 'orange'
                                : 'green',
                        fontFamily: 'Inter-Medium',
                    }}
                >
                    {item.service_status}
                </Text>
            </Text>
            <Text
                style={{
                    fontSize: 12,
                    color: '#999',
                    marginTop: 4,
                    fontFamily: 'Inter-Regular',
                }}
            >
                {formatDateOnly(item.entry_date)}
            </Text>
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
                                        borderColor: '#ddd',
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
                                    onChangeText={setCode}
                                    keyboardType="numeric"
                                    maxLength={4}
                                />
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
                                        onPress={() => setSelectedAction('Complete')}
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
                                        onPress={() => handleStatusChange(selectedAction)}
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
        </View>
    )
}

export default MyServices

const styles = StyleSheet.create({})