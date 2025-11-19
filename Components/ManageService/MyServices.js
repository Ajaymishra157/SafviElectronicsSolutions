import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { FlatList } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons'


const MyServices = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [services, setServices] = useState([
        {
            "service_id": "13",
            "staff_id": "36",
            "staff_name": "Pavitra ",
            "customer_id": "18",
            "customer_name": ".",
            "service_name": "light repair",
            "service_amount": "0",
            "order_no": "1",
            "service_status": "Complete",
            "status_code": "0",
            "cancle_note": "",
            "entry_date": "2025-11-05 14:25:49"
        },
        {
            "service_id": "10",
            "staff_id": "40",
            "staff_name": "PAMU",
            "customer_id": "173",
            "customer_name": "PIYUSH BHAI",
            "service_name": "ac",
            "service_amount": "2000",
            "order_no": "1",
            "service_status": "Pending",
            "status_code": "",
            "cancle_note": "",
            "entry_date": "2025-11-04 11:03:56"
        },
        {
            "service_id": "9",
            "staff_id": "48",
            "staff_name": "DHWNIT ",
            "customer_id": "173",
            "customer_name": "PIYUSH BHAI",
            "service_name": "fan",
            "service_amount": "20",
            "order_no": "1",
            "service_status": "Pending",
            "status_code": "",
            "cancle_note": "",
            "entry_date": "2025-11-04 10:46:31"
        },
        {
            "service_id": "8",
            "staff_id": "56",
            "staff_name": "RAJANI ",
            "customer_id": "182",
            "customer_name": "John Doe",
            "service_name": "fan repair",
            "service_amount": "0",
            "order_no": "2",
            "service_status": "Complete",
            "status_code": "0",
            "cancle_note": "",
            "entry_date": "2025-11-03 18:26:16"
        },
        {
            "service_id": "7",
            "staff_id": "11",
            "staff_name": "Lalabhai",
            "customer_id": "19",
            "customer_name": "MAHESH BHAI",
            "service_name": "bulp repair",
            "service_amount": "200",
            "order_no": "2",
            "service_status": "Complete",
            "status_code": "0",
            "cancle_note": "",
            "entry_date": "2025-11-03 05:45:21"
        },
        {
            "service_id": "6",
            "staff_id": "58",
            "staff_name": "JohnDoe",
            "customer_id": "182",
            "customer_name": "John Doe",
            "service_name": "abc",
            "service_amount": "20000",
            "order_no": "2",
            "service_status": "Complete",
            "status_code": "null",
            "cancle_note": "",
            "entry_date": "2025-10-30 12:10:45"
        },
        {
            "service_id": "5",
            "staff_id": "36",
            "staff_name": "Pavitra ",
            "customer_id": "182",
            "customer_name": "John Doe",
            "service_name": "xyz",
            "service_amount": "2000",
            "order_no": "2",
            "service_status": "Complete",
            "status_code": "1",
            "cancle_note": "Not any need",
            "entry_date": "2025-10-30 12:09:49"
        },
        {
            "service_id": "4",
            "staff_id": "49",
            "staff_name": "SHYAM",
            "customer_id": "182",
            "customer_name": "John Doe",
            "service_name": "bulp repair",
            "service_amount": "2000",
            "order_no": "2",
            "service_status": "Pending",
            "status_code": "",
            "cancle_note": "",
            "entry_date": "2025-10-30 11:59:00"
        },
    ]);


    const listMyServices = async () => {
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

    //   useFocusEffect(
    //         React.useCallback(() => {
    //             listUsers();
    //             listServices();
    //         }, [])
    //     );

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


                        {/* 👷 Assign Staff */}
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
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default MyServices

const styles = StyleSheet.create({})