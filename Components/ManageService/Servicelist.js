import React, { useEffect, useState } from 'react';
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
    Modal
} from 'react-native';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';



const Servicelist = ({ navigation }) => {
    // adjust if your path differs
    const { height: screenHeight } = useWindowDimensions();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });


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
            } else {
                setServices([]);
            }
        } catch (error) {
            console.log('Error fetching service list:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listServices();
        }, [])
    );
    // 🧭 Fix: Adjust modal position accurately
    const openModal = (item, x, y) => {
        setSelectedItem(item);
        // const adjustedY = y > screenHeight - 20 ? screenHeight - 150 : y; // prevent cutting bottom
        // setModalPosition({
        //     top: adjustedY,
        //     left: x - 100, // adjust left offset as per design
        // });
        setModalPosition({ top: y - 15, left: x - 110 });

        setModalVisible(true);
    };

    const handleEdit = () => {
        setModalVisible(false);
        navigation.navigate('OrderListService', { service: selectedItem, selectedOrderNo: selectedItem.order_no, selectedOrderId: selectedItem.order_id, customerid: selectedItem.customer_id, customerName: selectedItem.customer_name, });

    };

    const confirmDelete = () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this service?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: handleDelete },
            ]
        );
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
        return `${day}-${month}-${year}`;
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

            {/* List */}
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
                        source={require('../../assets/service.png')} // 👈 path to your image
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
                        <TouchableOpacity onPress={() => { confirmDelete(); setModalVisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                        </TouchableOpacity>
                        {/* )} */}
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
