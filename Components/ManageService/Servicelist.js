import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    AsyncStorage,
    Alert,
    useWindowDimensions,
    ToastAndroid,
    Modal, ScrollView, TextInput
} from 'react-native';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import DropDownPicker from 'react-native-dropdown-picker';
import Subheader from '../Commoncomponent/Subheader';



const Servicelist = ({ navigation }) => {
    // adjust if your path differs
    const { height: screenHeight } = useWindowDimensions();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const [assignModal, setAssignModal] = useState(false);
    const [openUser, setOpenUser] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userList, setUserList] = useState([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);


    // ✅ Search related state variables जोड़ें
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredServices, setFilteredServices] = useState([]);
    const [originalServices, setOriginalServices] = useState([]);

    // ✅ Search handler function
    const handleSearchChange = (text) => {
        setSearchTerm(text);
        // filterServices(text);
    };

    // ✅ Filter function
    const filterServices = useCallback((searchText) => {
        if (!searchText.trim()) {
            setFilteredServices(originalServices);
            return;
        }

        const lowerSearch = searchText.toLowerCase().trim();
        const filtered = originalServices.filter(item => {
            // Service name check
            const serviceNameMatch = item.service_name?.toLowerCase().includes(lowerSearch);

            // Staff name check
            const staffNameMatch = item.staff_name?.toLowerCase().includes(lowerSearch);

            // Customer name check
            const customerNameMatch = item.customer_name?.toLowerCase().includes(lowerSearch);

            return serviceNameMatch || staffNameMatch || customerNameMatch;
        });

        setFilteredServices(filtered);
    }, [originalServices]);

    const openDetailsModal = async (item) => {
        setSelectedServiceDetails(item);
        setDetailsModalVisible(true);
    };


    const listUsers = async () => {

        try {
            // const id = await AsyncStorage.getItem('admin_id');
            const url = `${Constant.URL}${Constant.OtherURL.user_list}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });
            const result = await response.json();
            if (result.code == "200") {
                const formatted = result.Payload.map(item => ({
                    label: item.user_name,
                    value: String(item.userid),
                }));
                setUserList(formatted);
            } else {
                setUserList([]);
            }
        } catch (error) {
            console.log('Network error in listUsers:', error);
        }
    };


    const listServices = async () => {
        try {
            setLoading(true);


            const url = `${Constant.URL}${Constant.OtherURL.list_service}`;// replace with actual endpoint
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

            });

            const result = await response.json();

            if (result.code == 200 && result.payload?.length > 0) {
                setServices(result.payload);
                setOriginalServices(result.payload); // ✅ Original data store करें
                setFilteredServices(result.payload);
            } else {
                setServices([]);
                setOriginalServices([]);
                setFilteredServices([]);
            }
        } catch (error) {
            console.log('Error fetching service list:', error);
            setOriginalServices([]);
            setFilteredServices([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listUsers();
            listServices();
        }, [])
    );
    // 🧭 Fix: Adjust modal position accurately
    const openModal = (item, x, y) => {
        setSelectedItem(item);

        setModalPosition({ top: y - 15, left: x - 150 });

        setModalVisible(true);
    };

    const handleEdit = () => {
        console.log("handleedit par ye items hai", selectedItem);
        setModalVisible(false);
        // navigation.navigate('OrderListService', { service: selectedItem, selectedOrderNo: selectedItem.order_no, selectedOrderId: selectedItem.order_id, customerid: selectedItem.customer_id, customerName: selectedItem.customer_name, staffName: selectedItem.staff_name, ProductId: selectedItem.product_id });
        navigation.navigate('AddService', { service: selectedItem, orderNo: selectedItem.order_no, selectedOrderId: selectedItem.order_id, customerid: selectedItem.customer_id, customerName: selectedItem.customer_name, staffName: selectedItem.staff_name, ProductId: selectedItem.product_id, productName: selectedItem.item_name, OrderId: selectedItem.order_id });
    };

    const confirmDelete = () => {
        setDeleteModalVisible(true);
    };

    const handleDelete = async () => {
        try {
            const url = `${Constant.URL}${Constant.OtherURL.delete_service}`;
            const payload = { service_id: selectedItem.service_id }; // ✅ exactly as API expects

            console.log('Deleting Service:', payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log('Delete Response:', result);

            if (result.code == 200) {

                ToastAndroid.show("Service deleted successfully!", ToastAndroid.LONG);
                setServices((prev) =>
                    prev.filter((s) => s.service_id !== selectedItem.service_id)
                );
                setOriginalServices((prev) =>
                    prev.filter((s) => s.service_id !== selectedItem.service_id)
                );
                setFilteredServices((prev) =>
                    prev.filter((s) => s.service_id !== selectedItem.service_id)
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to delete service.');
            }
        } catch (error) {
            console.log('Delete error:', error);
            Alert.alert('Error', 'Something went wrong.');
        }
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



    const assignStaff = async () => {
        try {
            if (!userId || !selectedItem?.service_id) {
                Alert.alert('Error', 'Please select both staff and service.');
                return;
            }



            const url = `${Constant.URL}${Constant.OtherURL.assign_staff}`; // 👈 yahan apna endpoint lagao

            const payload = {
                service_id: selectedItem.service_id,
                staff_id: userId,
            };

            console.log('Assign Staff Payload:', payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log('Assign Staff Response:', result);

            if (result.code == 200) {

                ToastAndroid.show("Staff assigned successfully!", ToastAndroid.LONG);
                setAssignModal(false);

                // ✅ optionally refresh the service list
                listServices();
            } else {
                Alert.alert('Error', result.message || 'Failed to assign staff.');
            }
        } catch (error) {
            console.log('Network error in assignStaff:', error);
            Alert.alert('Error', 'Something went wrong while assigning staff.');
        }
    };



    const renderItem = ({ item, index }) => (
        <View
            style={{
                backgroundColor: '#FFF',
                marginHorizontal: 12,
                marginVertical: 6,
                borderRadius: 12,
                padding: 14,
                elevation: 3,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowOffset: { width: 0, height: 1 },
                position: 'relative',
            }}
        >

            {/* THREE DOT ABSOLUTE RIGHT TOP */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    padding: 8,
                    zIndex: 10,
                    elevation: 10,
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={(e) => {
                    const { pageX, pageY } = e.nativeEvent;
                    openModal(item, pageX, pageY);
                }}
            >
                <Image
                    source={require('../../assets/threedot.png')}
                    style={{ height: 22, width: 22, tintColor: '#173161' }}
                />
            </TouchableOpacity>
            {/* 👁 EYE ICON BELOW THREE DOT */}
            <TouchableOpacity
                onPress={() => openDetailsModal(item)}
                style={{
                    position: 'absolute',
                    top: 45,          // 👈 three dot ke niche
                    right: 14,        // thoda left so it aligns nicely
                    padding: 6,
                    zIndex: 18,
                }}
            >
                <Ionicons
                    name="eye-outline"
                    size={20}
                    color="#173161"
                />
            </TouchableOpacity>


            {/* LABEL + VALUE ROWS */}
            {[
                { label: 'Party Name', value: item.customer_name },
                { label: 'Service Title', value: item.service_name },
                { label: 'Amount', value: `₹${item.service_amount}` },
                {
                    label: 'Status',
                    value: item.service_status,
                    color: item.service_status === 'Pending' ? 'orange' : 'green',
                },
                { label: 'Created On', value: formatDateOnly(item.entry_date) },
                { label: 'Assign Staff', value: item.staff_name || 'Not Assign' },
            ].map((row, i) => (
                <View
                    key={i}
                    style={{
                        flexDirection: 'row',
                        marginVertical: 2,
                    }}
                >
                    <Text
                        style={{
                            width: 110,
                            fontSize: 13,
                            color: '#777',
                            fontFamily: 'Inter-Medium',
                        }}
                    >
                        {row.label} :
                    </Text>

                    <Text
                        style={{
                            flex: 1,
                            fontSize: 13,
                            color: row.color || '#000',
                            fontFamily: 'Inter-SemiBold',
                            flexWrap: 'wrap',          // 👈 ADD THIS
                            lineHeight: 18,            // 👈 Better readability
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
            {/* <View
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
                    Service List
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
            </View> */}
            <Subheader headername="Service List" />

            {/* ✅ SEARCH BAR SECTION */}
            <View style={{
                marginHorizontal: 10,
                flexDirection: 'row',
                gap: 5,
                marginVertical: 10,
                alignItems: 'center'
            }}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#737373',
                    paddingHorizontal: 10,
                    paddingVertical: 5
                }}>
                    <Ionicons name="search" size={18} color="#173161" />
                    <TextInput
                        placeholder='Search by Service Name, Staff Name, Party Name'
                        placeholderTextColor='gray'
                        value={searchTerm}
                        onChangeText={handleSearchChange}
                        style={{
                            flex: 1,
                            fontFamily: 'Inter-Medium',
                            fontSize: 14,
                            color: '#173161',
                            marginLeft: 8,
                            paddingVertical: 5
                        }}
                        autoCapitalize="none"
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => {
                            setSearchTerm('');
                            setFilteredServices(originalServices); // reset
                        }}>
                            <Ionicons name="close-circle" size={18} color="#999" />
                        </TouchableOpacity>
                    )}

                </View>

                <TouchableOpacity
                    style={{
                        backgroundColor: '#173161',
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 10,
                        paddingHorizontal: 12
                    }}
                    onPress={() => {
                        filterServices(searchTerm); // ✅ call filter on button click
                    }}
                >
                    <Text style={{
                        color: '#fff',
                        fontFamily: 'Inter-Medium',
                        fontSize: 14
                    }}>
                        Search
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#173161" />
                </View>
            ) : filteredServices.length > 0 ? (
                <FlatList
                    // data={services}
                    data={filteredServices}
                    // ✅ FIXED (Unique key guarantee)
                    keyExtractor={(item, index) => {
                        // Agar service_id unique nahi hai to combination use karo
                        if (item.service_id) {
                            return `service-${item.service_id}-${index}`;
                        } else {
                            // Fallback agar service_id nahi hai
                            return `service-${item.order_id}-${item.product_id}-${index}`;
                        }
                    }}
                    keyboardShouldPersistTaps='handled'
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

            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalVisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
                    {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
                    <View
                        onStartShouldSetResponder={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: modalPosition.top,
                            left: modalPosition.left,
                            gap: 10,
                            backgroundColor: '#fff',
                            paddingHorizontal: 20,
                            paddingBottom: 20,
                            paddingTop: 10,
                            borderRadius: 10,
                        }}
                    >
                        {/* {hasCategoryPermissions.Update && ( */}
                        <TouchableOpacity onPress={handleEdit} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        {/* )} */}
                        {/* {hasCategoryPermissions.Delete && ( */}
                        {selectedItem?.service_status !== 'Complete' && (
                            <TouchableOpacity onPress={() => { confirmDelete(); setModalVisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                            </TouchableOpacity>
                        )}
                        {/* )} */}
                        {/* 👷 Assign Staff */}
                        {selectedItem?.service_status !== 'Complete' && (
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    setTimeout(() => {
                                        setUserId(selectedItem?.staff_id ? String(selectedItem.staff_id) : '');
                                        setAssignModal(true);
                                    }, 200);
                                }}
                                style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#173161" style={{}} />
                                <Text
                                    style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}
                                >
                                    Assign Staff
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
            {/* 🔹 Staff Assign Modal */}
            <Modal visible={assignModal} transparent={true} animationType="slide">
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }}
                    onPress={() => { setAssignModal(false); setUserId(selectedItem?.staff_id || ''); }}
                    activeOpacity={1}
                >
                    <View
                        onStartShouldSetResponder={(e) => e.stopPropagation()}
                        style={{
                            width: '85%',
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            padding: 20,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontFamily: 'Inter-SemiBold',
                                color: '#173161',
                                marginBottom: 15,
                            }}
                        >
                            Assign Staff
                        </Text>

                        {/* ✅ Staff Dropdown */}
                        <DropDownPicker
                            placeholder="Select Staff"
                            open={openUser}
                            value={userId}
                            items={userList}
                            setOpen={(isOpen) => setOpenUser(isOpen)}
                            setValue={setUserId}
                            searchable={true}
                            searchablePlaceholder="Search Staff..."
                            listMode="MODAL"
                            modalProps={{
                                keyboardShouldPersistTaps: 'always',
                            }}
                            style={{
                                height: 45,
                                borderRadius: 10,
                                borderColor: 'gray',
                                backgroundColor: '#F5F5F5',
                                marginBottom: 20,
                            }}
                            textStyle={{
                                fontFamily: 'Inter-Medium',
                                fontSize: 14,
                                color: '#000',
                            }}
                            dropDownContainerStyle={{
                                borderColor: '#CCC',
                            }}
                        />

                        {/* 🔘 Buttons */}
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 10,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => { setAssignModal(false); setUserId(selectedItem?.staff_id || ''); }}
                                style={{
                                    backgroundColor: '#ccc',
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    flex: 0.45,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#000',
                                        fontFamily: 'Inter-Medium',
                                        fontSize: 14,
                                    }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    assignStaff();
                                }}
                                style={{
                                    backgroundColor: '#173161',
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    flex: 0.45,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontFamily: 'Inter-Medium',
                                        fontSize: 14,
                                    }}
                                >
                                    Assign
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                {/* Background Overlay */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setDeleteModalVisible(false)}
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20
                    }}
                >

                    {/* Center Container */}
                    <View
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 12,
                            padding: 20,
                            width: '80%',
                        }}
                        onStartShouldSetResponder={(e) => e.stopPropagation()}
                    >
                        <View style={{ alignItems: 'center' }}>
                            <Text
                                style={{
                                    fontFamily: 'Inter-Bold',
                                    fontSize: 18,
                                    color: '#D9534F',
                                    marginBottom: 8,
                                }}
                            >
                                Confirm Delete
                            </Text>

                            <Text
                                style={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 14,
                                    color: '#555',
                                    textAlign: 'center',
                                    marginBottom: 20,
                                }}
                            >
                                Are you sure you want to delete this service?
                            </Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>

                                {/* CANCEL BUTTON */}
                                <TouchableOpacity
                                    onPress={() => setDeleteModalVisible(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#ccc',
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        marginRight: 5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            color: '#173161',
                                            fontFamily: 'Inter-SemiBold',
                                        }}
                                    >
                                        No
                                    </Text>
                                </TouchableOpacity>

                                {/* DELETE BUTTON */}
                                <TouchableOpacity
                                    onPress={() => {
                                        setDeleteModalVisible(false);
                                        handleDelete();
                                    }}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#D9534F',
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        marginLeft: 5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            color: '#fff',
                                            fontFamily: 'Inter-SemiBold',
                                        }}
                                    >
                                        Yes
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>

                </TouchableOpacity>
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
                        position: 'relative',
                    }}
                        onStartShouldSetResponder={(e) => e.stopPropagation()}>
                        {/* ABSOLUTE CLOSE BUTTON */}
                        <TouchableOpacity
                            onPress={() => setDetailsModalVisible(false)}
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                padding: 5,
                                zIndex: 100,
                            }}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 20,
                            paddingBottom: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f0f0f0',
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
                            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
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
                                    </View>
                                </View>

                                {/* Service Information */}
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



            {/* ➕ Create New Service Button */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 15,
                    alignSelf: 'center',
                    zIndex: 10,
                }}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('SearchServicecustomer')}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#173161',
                        paddingVertical: 12,
                        paddingHorizontal: 18,
                        borderRadius: 25,
                        elevation: 6,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowOffset: { width: 0, height: 3 },
                        shadowRadius: 4,
                    }}
                >
                    <Image
                        source={require('../../assets/service.png')} // ✅ use your add icon here
                        style={{
                            height: 20,
                            width: 20,
                            tintColor: '#fff',
                            marginRight: 8,
                        }}
                    />
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 16,
                            fontFamily: 'Inter-SemiBold',
                        }}
                    >
                        Create New Service
                    </Text>
                </TouchableOpacity>
            </View>


        </View>
    );
};

export default Servicelist;
