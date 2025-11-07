import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, Keyboard, RefreshControl, Linking, Modal, TextInput, Dimensions, StatusBar, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import { useFocusEffect } from '@react-navigation/native';
import Constant from '../Commoncomponent/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyButton from '../Commoncomponent/MyButton';

const Purchaselist = ({ navigation, route }) => {
    const { order_no, filterdate, filterstatus, filtertext } = route.params || {}
    const [permissions, setPermissions] = useState([]);
    const [myorders, setMyorders] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    // const [formatteddate, setFormattedDate] = useState(filterdate || null);
    const [formatteddate, setFormattedDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const [refreshing, setRefreshing] = useState(false);
    const [usertype, setUsertype] = useState(null);
    const [user_id, setUser_id] = useState(null);
    const [advanceorder, setAdvanceOrder] = useState(null);
    const [selectedorder, setSelectedOrder] = useState(null);
    const [isordermerged, setIsorderMerged] = useState(null);
    const [selectedorderstatus, setSelectedorderstatus] = useState(null);
    const [urgentorder, setUrgentorder] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filtertext ? filtertext : '');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [remark, setRemark] = useState(null);
    const [orderdetails, setOrderDetails] = useState(null);
    const [orderdetaimodal, setOrderdetailModal] = useState(false);

    const [openstatus, setOpenStatus] = useState(false); // Controls dropdown visibility
    const [valuestatus, setValueStatus] = useState(filterstatus ? filterstatus : 'Pending'); // Selected category value
    const [itemsstatus, setItemsStatus] = useState([
        { label: 'All Status', value: 'All Status' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Loading', value: 'Loading' },
        { label: 'Cancel', value: 'Cancelled' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Advanced', value: 'Advanced' },
        { label: 'On The Way', value: 'On The Way' }
    ]);

    const [openloadingopt, setOpenLoadingopt] = useState(false); // Controls dropdown visibility
    const [valueloadingopt, setValueLoadingopt] = useState('Drop'); // Selected category value
    const [itemsloadingopt, setItemsLoadingopt] = useState([
        { label: 'Drop', value: 'Drop' },
        { label: 'PickUp', value: 'PickUp' },
    ]);
    const [openvehicle, setOpenVehicle] = useState(false); // Controls dropdown visibility
    const [valuevehicle, setValueVehicle] = useState(null); // Selected category value
    const [itemsvehicle, setItemsVehicle] = useState([]);
    const [addvehicle, setAddvehicle] = useState(null);
    const [vehiclemodal, setVehiclemodal] = useState(false);

    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const [remarkmodal, setRemarkModal] = useState(false);
    const scrollRef = useRef();

    useFocusEffect(
        React.useCallback(() => {
            if (order_no) {
                const focusedOrderNo = order_no;
                const focusedIndex = myorders.findIndex(order => order.order_no === focusedOrderNo);

                if (focusedIndex != -1 && scrollRef.current) {
                    // Calculate the scroll position based on the index
                    const itemHeight = 300; // Adjust this based on the height of your order items
                    const scrollY = focusedIndex * itemHeight;
                    scrollRef.current.scrollTo({ y: scrollY, animated: true });
                }
            }
        }, [myorders, order_no])
    );

    const openModal = (item, x, y) => {
        const modalWidth = 200; // Modal width (fixed)
        const windowWidth = Dimensions.get('window').width;
        const extraSpace = 40; // Adjust this value for more space
        const centerX = x - modalWidth / 2;
        const leftPosition = Math.max(20, Math.min(centerX, windowWidth - modalWidth - extraSpace));

        setModalPosition({ top: y - 15, left: leftPosition });
        setSelectedOrder(item.order_no);
        setIsorderMerged(item.merge_order);
        setSelectedorderstatus(item.status);
        setUrgentorder(item.set_urgent);
        setModalvisible(true);
    };

    const openMergeOrderModal = (selectedOrderNo) => {
        navigation.navigate('MergeOrder', { selectedOrderNo })
    };

    const handleChangeDate = (event, selectedDate) => {
        if (event.type == 'dismissed') {
            setShow(false);
            return;
        }
        const currentDate = selectedDate || new Date();
        setShow(false);

        // Format date as YYYY/MM/DD
        const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

        setDate(currentDate); // Save the actual date object
        setFormattedDate(formattedDate); // Save the formatted string
    };

    const formatfilterDate = (dateString) => {
        if (!dateString) return "00-00-0000"; // Default if no date is provided
        const date = new Date(dateString); // Convert to Date object
        const day = String(date.getDate()).padStart(2, '0'); // Get day and pad if needed
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based, add 1)
        const year = date.getFullYear(); // Get full year

        return `${day}/${month}/${year}`;
    };

    const fetchusertype = async () => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.fetch_usertype}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setUsertype(result.payload.user_type)
        } else {
            console.log('Error fetching permissions');
        }
        setLoading(false);
    };

    // const listPermissions = async () => {
    //   setMainloading(true);
    //   const id = await AsyncStorage.getItem('admin_id');
    //   const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
    //   const response = await fetch(url, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ user_id: id }),
    //   });
    //   const result = await response.json();
    //   if (result.code == "200") {
    //     let permissionsData = {};
    //     result.payload.forEach((item) => {
    //       const permsArray = item.menu_permission.split(',');
    //       let permsObject = {};
    //       permsArray.forEach((perm) => {
    //         permsObject[perm] = true;
    //       });
    //       permissionsData[item.menu_name] = permsObject;
    //     });

    //     setPermissions(permissionsData);
    //   } else {
    //     console.log('Error fetching permissions');
    //   }
    //   setMainloading(false);
    // };

    const hasPermissions = permissions['Orders'] || {};
    const hasmarginPermissions = permissions['Show Margin'];

    useFocusEffect(
        React.useCallback(() => {
            fetchusertype();

        }, [])
    );

    const listmyorders = async (query) => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        setUser_id(id)

        // const formattedDate = formatteddate.toISOString().split('T')[0];
        const searchQuery = query || "";
        const orderDate = formatteddate || null;

        const url = `${Constant.URL}${Constant.OtherURL.confirm_purchaselist}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: usertype == 'Admin' ? '' : id,
                status: valuestatus,
                purchase_date: orderDate,
                search: searchQuery
            }),
        });


        const result = await response.json();

        if (result.code == "200") {
            setMyorders(result.payload);
            // setAdvanceOrder(result.count)
        } else {
            setMyorders([]);
            console.log('error while listing orders');
        }
        setLoading(false);
        setInitialLoading(false);
    };

    const handleSearchChange = (text) => {
        setSearchTerm(text);

        // // Clear any previous timeout
        // if (searchTimeout) {
        //   clearTimeout(searchTimeout);
        // }

        // // Set a new timeout for debouncing API calls
        // const newTimeout = setTimeout(() => {
        //   listmyorders(text);
        // }, 500);

        // setSearchTimeout(newTimeout);
    };

    useFocusEffect(
        React.useCallback(() => {
            listmyorders();
        }, [])
    );

    const setorderurgent = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.set_urgent}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: selectedorder,
                argent_type: 'Set Urgent',
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setModalvisible(false);
            listmyorders();
        } else {
            console.log('error while listing product');
        }
        setMainloading(false);
    };

    const Unmergeorder = async (selectedorder) => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.mergeorder_delete}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: selectedorder,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setModalvisible(false);
            listmyorders();
        } else {
            console.log('error while unmerging order');
        }
        setMainloading(false);
    };

    const handleSelectUnMergeOrder = (orderNo) => {
        Alert.alert(
            "Confirm Unmerge",
            `Are you sure you want to unmerge order ${selectedorder}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: () => Unmergeorder(orderNo) }
            ]
        );
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setSearchTerm(null);
        navigation.setParams({ order_no: null });
        listmyorders().then(() => setRefreshing(false));
    }, [formatteddate, valuestatus, searchTerm]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // 12 AM/PM case

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    const listvehicle = async () => {
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.list_vehicle_entries}`;
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
                label: item.vic_no,
                value: item.id,
            }));
            setItemsVehicle(formattedItems);
        } else {
            setItemsVehicle([])
            console.log('error while listing vehicle');
        }
        setLoading(false);
    };
    useFocusEffect(
        React.useCallback(() => {
            listvehicle();
        }, [])
    );

    const updateStatus = async (status, remark) => {
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.update_status}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                order_no: selectedorder,
                status: status,
                remarks: remark
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setModalvisible(false);
            listmyorders();
            setRemark('');
            setRemarkModal(false);
        } else {
            console.log('error while listing vehicle');
        }
        setLoading(false);
    };

    const [errors, setErrors] = useState({
        addvehicle: '',
        selectvehicle: '',
    });

    const validateFields = () => {
        const newErrors = {};

        if (valueloadingopt == "Drop") {
            newErrors.selectvehicle = valuevehicle ? '' : 'Vehicle is required';
        } else {
            newErrors.addvehicle = addvehicle ? '' : 'Vehicle is required';
        }

        setErrors(newErrors);

        return Object.values(newErrors).every((error) => error === '');
    };


    const vehicleentry = async () => {
        if (!validateFields()) return;
        setLoading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const selectedVehicle = itemsvehicle.find(item => item.value === valuevehicle);
        const vehicleLabel = selectedVehicle ? selectedVehicle.label : valuevehicle;
        const url = `${Constant.URL}${Constant.OtherURL.add_vic_entry}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id,
                order_no: selectedorder,
                vic_no: addvehicle ? addvehicle : vehicleLabel,
                type: valueloadingopt
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setVehiclemodal(false);
            setValueLoadingopt('Drop')
            setOpenLoadingopt(false);
            setOpenVehicle(false);
            setValueVehicle(null);
            setAddvehicle(null);
            listmyorders();
            updateStatus("Loading", "");
        } else {
            console.log('error while listing vehicle');
        }
        setLoading(false);
    };

    const handleOnTheWay = (status) => {
        if (status == 'On The Way') {
            updateStatus("Cancel On The Way", "");
        } else {
            updateStatus("On The Way", "");
        }
    };

    const handleresettopending = () => {
        updateStatus("Pending", '');
    };

    const handleCancel = () => {
        updateStatus("Cancelled", remark);
    };

    const handleloading = (status) => {
        if (status == 'Loading') {
            updateStatus("Cancel Loading", "");
        } else {
            setVehiclemodal(true);
            setModalvisible(false)
        }
    };

    const fetchorderdetails = async (order_no) => {
        // setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.confirmlist_purchase}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: order_no,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setOrderDetails(result.payload);
            setOrderdetailModal(true);
        } else {
            // setOrderDetails([]);
            console.log('error while listing product');
        }
        // setMainloading(false);
    };

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        // <TouchableWithoutFeedback onPress={() => { setOpenStatus(false); Keyboard.dismiss(); }}>
        <View style={{ flex: 1 }}>
            <View>
                <StatusBar backgroundColor="#173161" barStyle="light-content" />
                <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
                    </TouchableOpacity>
                    <Text numberOfLines={1} style={{ color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 0 }}>My Purchase</Text>
                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 18, marginLeft: 20 }}>..</Text>
                </View>
            </View>


            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 10, marginBottom: 10 }}>
                <TouchableOpacity onPress={() => { Keyboard.dismiss(); setShow(true); setOpenStatus(false) }} style={{ width: '46%', }}>
                    <Text style={{ fontFamily: 'Inter-Medium', height: 50, fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: 'gray', borderRadius: 11, paddingTop: 15 }}>{formatteddate ? formatfilterDate(formatteddate) : 'Select Date'}</Text>
                </TouchableOpacity>
                <View style={{ width: '46%', zIndex: 999 }}>
                    <DropDownPicker
                        placeholder="Select Status"
                        open={openstatus}
                        value={valuestatus}
                        items={itemsstatus}
                        setOpen={(openState) => {
                            setOpenStatus(openState);
                            if (openState) {
                                Keyboard.dismiss();
                            }
                        }}
                        setValue={setValueStatus}
                        setItems={setItemsStatus}
                        style={{
                            // width: '92%',
                            height: 40,
                            borderRadius: 10,
                            borderColor: 'gray',
                            backgroundColor: '#F5F5F5',
                            alignSelf: 'center'
                        }}
                        textStyle={{
                            fontFamily: 'Inter-Medium',
                            fontSize: 14,
                            color: '#000',
                        }}
                        placeholderStyle={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: 'gray',
                        }}
                        dropDownContainerStyle={{
                            position: 'absolute', // Make it overlap
                            top: -40, // Align it with the top of the input
                            right: -10,
                            borderColor: '#fff',
                            borderRadius: 10,
                            shadowColor: '#000',
                            shadowOpacity: 0.1,
                            elevation: 2,
                            backgroundColor: '#fff',
                            maxHeight: 600,
                        }}
                    />
                </View>

                {show && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={handleChangeDate}
                    />
                )}
            </View> */}

            <View style={{ marginHorizontal: 10, flexDirection: 'row', gap: 5, marginBottom: 5, marginTop: 10 }}>
                <TextInput placeholder='Search By Purchase No | Party' value={searchTerm} onChangeText={handleSearchChange} placeholderTextColor='gray' style={{ flex: 1, fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161', borderWidth: 1, borderColor: '#737373', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10 }} />
                <TouchableOpacity onPress={() => listmyorders(searchTerm)} style={{ flexDirection: 'row', backgroundColor: '#173161', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginHorizontal: 0, padding: 10, paddingHorizontal: 15 }}>
                    <Ionicons name="search" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* {advanceorder ? (
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#e60000', marginHorizontal: 20 }}>
                    Advance Orders: {advanceorder}
                </Text>
            ) : null} */}

            <View style={{ flex: 1, }}>
                <ScrollView ref={scrollRef} keyboardShouldPersistTaps='handled' nestedScrollEnabled={true} refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                    {initialLoading || loading ? (
                        <View style={{ alignItems: 'center', marginTop: 10 }}>
                            <ActivityIndicator size="large" color="#173161" />
                        </View>
                    ) :
                        myorders.length == 0 ? (
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
                                <Image
                                    source={require('../../assets/sell.png')} // 👈 path to your image
                                    style={{ width: 120, height: 120, resizeMode: 'contain', marginBottom: 15, tintColor: '#173161' }}
                                />
                                <Text
                                    style={{
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 14,
                                        color: '#173161',
                                    }}
                                >
                                    No Purchases available
                                </Text>
                            </View>
                        ) : (
                            myorders.map((item, index) => (
                                <View key={index} style={{
                                    gap: 10, paddingBottom: item.merge_order ? (Math.max(...item.merge_order.split(',').map(Number)) == Number(item.order_no) ? 0 : 5) : 5,
                                    paddingTop: item.merge_order ? (Math.min(...item.merge_order.split(',').map(Number)) == Number(item.order_no) ? 2 : 5) : 5,
                                    borderRightWidth: (item.merge_order && item.status != 'Delivered' && item.status != 'Cancelled') ? 2 : 0, borderLeftWidth: (item.merge_order && item.status != 'Delivered' && item.status != 'Cancelled') ? 2 : 0,
                                    // borderBottomWidth: (item.merge_order  && item.status!='Delivered' && item.status != 'Cancelled') ? (Math.max(...item.merge_order.split(',').map(Number)) == Number(item.order_no) ? 0 : 2) : 0,
                                    borderBottomWidth: (item.merge_order && item.status != 'Delivered' && item.status != 'Cancelled')
                                        ? (
                                            (() => {
                                                const mergeOrders = item.merge_order.split(',').map(Number);
                                                const minOrder = Math.min(...mergeOrders);
                                                const maxOrder = Math.max(...mergeOrders);
                                                const minOrderItem = myorders.find(o => Number(o.order_no) == minOrder);

                                                if (!minOrderItem) {
                                                    return maxOrder == Number(item.order_no) ? 2 : 0;
                                                }

                                                return (minOrderItem.status == 'Delivered' || minOrderItem == 'Cancelled')
                                                    ? (maxOrder == Number(item.order_no) ? 2 : 0)
                                                    : (maxOrder == Number(item.order_no) ? 0 : 2);
                                            })()
                                        )
                                        : 0,
                                    // (Math.min(...item.merge_order.split(',').map(Number)) == Number(item.order_no) ? 0 : 2) : 0,
                                    borderTopWidth: (item.merge_order && item.status != 'Delivered' && item.status != 'Cancelled') ?
                                        (
                                            (() => {
                                                const mergeOrders = item.merge_order.split(',').map(Number);
                                                const minOrder = Math.min(...mergeOrders);
                                                const maxOrder = Math.max(...mergeOrders);
                                                const maxOrderItem = myorders.find(o => Number(o.order_no) == maxOrder);

                                                if (!maxOrderItem) {
                                                    return minOrder == Number(item.order_no) ? 2 : 0;
                                                }

                                                return (maxOrderItem.status == 'Delivered' || maxOrderItem == 'Cancelled')
                                                    ? (minOrder == Number(item.order_no) ? 2 : 0)
                                                    : (minOrder == Number(item.order_no) ? 0 : 2);
                                            })()
                                        )
                                        : 0,
                                    borderColor: '#000', marginHorizontal: item.merge_order ? 7 : 0,
                                    marginTop: index > 0 && item.merge_order != myorders[index - 1].merge_order ? 10 : 0,
                                }}>
                                    <View
                                        style={{
                                            backgroundColor:
                                                item.status == 'Pending' && item.set_urgent == 'Yes'
                                                    ? '#ffcccc'
                                                    : item.payment_mode == 'Cash'
                                                        ? '#ccffcc'
                                                        : item.payment_mode == 'Baki'
                                                            ? '#ffcc99'
                                                            : item.payment_mode == 'Bank Transfer'
                                                                ? '#d3d3d3'
                                                                : item.status == 'Loading'
                                                                    ? '#ffffcc'
                                                                    : item.status == 'On The Way'
                                                                        ? '#ccccff'
                                                                        : '#fff',
                                            borderRadius: 10,
                                            padding: 10,
                                            marginHorizontal: item.merge_order ? 3 : 10,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.25,
                                            shadowRadius: 3.84,
                                            elevation: 5,
                                        }}
                                    >
                                        {/* Header row */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>
                                                    Purchase Number:{' '}
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontFamily: 'Inter-Regular',
                                                        fontSize: 14,
                                                        color: '#173161',
                                                        textTransform: 'uppercase',
                                                    }}
                                                >
                                                    {item.order_no}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Details + right icon row */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                                            {/* Left side details */}
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Name: </Text>
                                                    <Text
                                                        style={{
                                                            flexShrink: 1,
                                                            fontFamily: 'Inter-Regular',
                                                            fontSize: 14,
                                                            color: '#173161',
                                                            textTransform: 'uppercase',
                                                        }}
                                                    >
                                                        {item.vendor_name || '---'}
                                                        {item.area ? ` (${item.area})` : ''}
                                                    </Text>
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Purchase Date: </Text>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'Inter-Regular',
                                                            fontSize: 14,
                                                            color: '#173161',
                                                            textTransform: 'uppercase',
                                                        }}
                                                    >
                                                        {formatDate(item.purchase_date)}
                                                    </Text>
                                                </View>

                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Purchase Remark: </Text>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'Inter-Regular',
                                                            fontSize: 14,
                                                            color: '#173161',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {item.order_remark}
                                                    </Text>
                                                </View>

                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>Purchase By: </Text>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'Inter-Regular',
                                                            fontSize: 14,
                                                            color: '#173161',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {item.user_name}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Right side icon */}
                                            {/* {(usertype == 'Admin' ||
                                                usertype == 'Transporter' ||
                                                (usertype == 'Salesman' && user_id === item.user_id)) && ( */}
                                            <TouchableOpacity
                                                onPress={() =>
                                                    navigation.navigate('PurchaseDetails', {
                                                        order_no: item.order_no,
                                                        orderdate: item.purchase_date,
                                                        customername: item.full_name,
                                                        Remark: item.remark,
                                                        companyname: item.vendor_name,
                                                        location_link: item.location_link,
                                                        orderstatus: item.status,
                                                        area: item.area,
                                                        formatteddate,
                                                        valuestatus,
                                                        searchTerm: searchTerm,
                                                    })
                                                }
                                                style={{
                                                    padding: 8,
                                                    marginLeft: 10,
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <Image
                                                    source={require('../../assets/skip-track.png')}
                                                    style={{ height: 22, width: 22, tintColor: '#173161' }}
                                                />
                                            </TouchableOpacity>
                                            {/* )} */}
                                        </View>
                                    </View>


                                </View>
                            ))
                        )}
                </ScrollView>
                <View style={{ marginTop: 10, padding: 10 }}>
                    <MyButton btnname="Create New Purchase" background="#0a326e" fontsize={18} textcolor="#FFF" runFunc={() => navigation.navigate('SearchPurchaseCustomer')} />
                </View>
            </View>

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
                        {usertype != 'Transporter' && selectedorderstatus != 'Cancelled' &&
                            <TouchableOpacity disabled={selectedorderstatus != 'Pending'} onPress={setorderurgent} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: selectedorderstatus != 'Pending' ? 0.5 : 1 }}>
                                <Image source={require('../../assets/exclamation.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{urgentorder == 'Yes' ? 'Cancel Urgent' : 'Set Urgent'}</Text>
                            </TouchableOpacity>}
                        {usertype != 'Salesman' && selectedorderstatus != 'Cancelled' &&
                            <>
                                <TouchableOpacity disabled={selectedorderstatus == 'On The Way'} onPress={() => handleloading(selectedorderstatus)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: selectedorderstatus == 'On The Way' ? 0.5 : 1 }}>
                                    <Image source={require('../../assets/truck.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedorderstatus == 'Loading' ? 'Cancel Loading' : 'Loading'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity disabled={selectedorderstatus == 'Pending'} onPress={() => handleOnTheWay(selectedorderstatus)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: selectedorderstatus == 'Pending' ? 0.5 : 1 }}>
                                    <Image source={require('../../assets/vehicle.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedorderstatus == 'On The Way' ? 'Cancel On The Way' : 'On The Way'}</Text>
                                </TouchableOpacity>
                            </>}
                        {(usertype == 'Admin' && selectedorderstatus == 'Pending' && selectedorderstatus != 'Cancelled') && (
                            <TouchableOpacity onPress={() => { (isordermerged == null ? openMergeOrderModal(selectedorder) : handleSelectUnMergeOrder(selectedorder)); setRemarkModal(false); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: 1 }}>
                                <Image source={require('../../assets/merge.png')} style={{ height: 16, width: 16, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{isordermerged == null ? 'Merge Order' : 'Unmerge Order'}</Text>
                            </TouchableOpacity>
                        )}
                        {(hasPermissions.Cancel && selectedorderstatus != 'Delivered' && selectedorderstatus != 'Cancelled') && (
                            <TouchableOpacity onPress={() => { setRemarkModal(true); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: 1 }}>
                                <Image source={require('../../assets/cancel.png')} style={{ height: 14, width: 14, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Cancel</Text>
                            </TouchableOpacity>
                        )}

                        {(selectedorderstatus == 'Cancelled') && (
                            <TouchableOpacity onPress={() => handleresettopending()} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: 1 }}>
                                <Image source={require('../../assets/reset.png')} style={{ height: 14, width: 14, tintColor: '#173161' }} />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Reset To Pending</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Loading drop and pickup modal */}
            <Modal visible={vehiclemodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setVehiclemodal(false); setOpenLoadingopt(false); setOpenVehicle(false); setValueLoadingopt('Drop') }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 20, paddingTop: 20, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ color: '#fff' }}>*</Text>
                            <TouchableOpacity onPress={() => { setVehiclemodal(false); setOpenLoadingopt(false); setOpenVehicle(false); setValueLoadingopt('Drop') }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: '#404040', fontFamily: 'Inter-SemiBold', fontSize: 14, borderWidth: 1, opacity: 0.5, borderColor: 'gray', borderRadius: 10, padding: 10, paddingVertical: 15, marginHorizontal: 5, marginBottom: 10 }}>Loading</Text>
                        <View style={{ marginBottom: 20, zIndex: openloadingopt ? 3000 : 1 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Transport Type
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <DropDownPicker
                                placeholder="Select option"
                                open={openloadingopt}
                                value={valueloadingopt}
                                items={itemsloadingopt}
                                setOpen={(isOpen) => {
                                    setOpenLoadingopt(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                        setOpenVehicle(false);
                                    }
                                }}
                                setValue={setValueLoadingopt}
                                setItems={setItemsLoadingopt}
                                style={{
                                    width: '95%',
                                    height: 40,
                                    borderRadius: 5,
                                    borderColor: '#173161',
                                    alignSelf: 'center'
                                }}
                                textStyle={{
                                    fontFamily: 'Inter-Bold',
                                    fontSize: 14,
                                    color: '#173161',
                                }}
                                placeholderStyle={{
                                    fontFamily: 'Inter-Regular',
                                    fontSize: 14,
                                    color: 'gray',
                                }}
                                dropDownContainerStyle={{
                                    borderColor: '#fff',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 3,
                                    elevation: 2,
                                    backgroundColor: '#fff'
                                }}
                            />
                            {/* {errors.category ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 10, marginLeft: 10 }}>{errors.category}</Text> : null} */}
                        </View>

                        {valueloadingopt == 'Drop' ? (
                            <View style={{ marginBottom: 20, zIndex: openvehicle ? 2000 : 1 }}>
                                <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Vehicle
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <DropDownPicker
                                    placeholder="Select Vehicle"
                                    open={openvehicle}
                                    value={valuevehicle}
                                    items={itemsvehicle}
                                    setOpen={(isOpen) => {
                                        setOpenVehicle(isOpen);
                                        if (isOpen) {
                                            Keyboard.dismiss();
                                            setOpenLoadingopt(false);
                                        }
                                    }}
                                    setValue={setValueVehicle}
                                    setItems={setItemsVehicle}
                                    style={{
                                        width: '95%',
                                        height: 40,
                                        borderRadius: 5,
                                        borderColor: errors.selectvehicle ? 'red' : '#173161',
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 14,
                                        color: '#173161',
                                    }}
                                    placeholderStyle={{
                                        fontFamily: 'Inter-Regular',
                                        fontSize: 14,
                                        color: 'gray',
                                    }}
                                    dropDownContainerStyle={{
                                        borderColor: '#fff',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 3,
                                        elevation: 2,
                                        backgroundColor: '#fff'
                                    }}
                                />
                                {errors.selectvehicle ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 10, marginLeft: 10 }}>{errors.selectvehicle}</Text> : null}

                            </View>
                        ) : (
                            <>
                                <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Vehicle
                                    <Text style={{ color: '#e60000' }}>*</Text>
                                </Text>
                                <TextInput
                                    placeholder="Enter Vehicle"
                                    placeholderTextColor='gray'
                                    value={addvehicle}
                                    onChangeText={setAddvehicle}
                                    style={{ marginHorizontal: 10, borderWidth: 1, borderColor: errors.addvehicle ? 'red' : '#ccc', borderRadius: 5, padding: 10, marginBottom: errors.addvehicle ? 10 : 20, color: '#000', fontFamily: 'Inter-Regular' }}
                                /></>
                        )}
                        {errors.addvehicle ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 10, marginBottom: 10 }}>{errors.addvehicle}</Text> : null}

                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={() => { vehicleentry(); }} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { setVehiclemodal(false); setOpenLoadingopt(false); setOpenVehicle(false); setValueLoadingopt('Drop') }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                    <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={remarkmodal} transparent animationType="slide">
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <View
                        style={{
                            width: '80%',
                            padding: 20,
                            backgroundColor: 'white',
                            borderRadius: 10,
                        }}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Inter-Regular', color: '#000' }}>
                            </Text>
                            <TouchableOpacity onPress={() => { setRemarkModal(false) }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 14, marginLeft: 5, marginBottom: 10, fontFamily: 'Inter-Regular', color: 'gray' }}>
                            Enter Remark
                        </Text>
                        <TextInput
                            style={{
                                width: '100%',
                                borderWidth: 1,
                                borderColor: '#ccc',
                                padding: 10,
                                borderRadius: 10,
                                marginBottom: 20,
                                color: '#000',
                                fontFamily: 'Inter-Regular'
                            }}
                            value={remark}
                            onChangeText={setRemark}
                        />
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity onPress={handleCancel} style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '40%', alignItems: 'center' }} >
                                {mainloading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* order details */}
            <Modal visible={orderdetaimodal} transparent animationType="slide">
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    activeOpacity={1}
                    onPress={() => setOrderdetailModal(false)}
                >
                    <TouchableOpacity
                        style={{
                            width: '95%',
                            paddingVertical: 20,
                            paddingHorizontal: 5,
                            backgroundColor: 'white',
                            borderRadius: 10,
                        }}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 10, borderBottomWidth: 0.5, borderColor: '#ccc', paddingBottom: 3 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#000' }}>Profit Summary</Text>
                            <TouchableOpacity onPress={() => { setOrderdetailModal(false) }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>

                        {orderdetails && orderdetails.length > 0 && (
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#666', marginBottom: 2, marginLeft: 10 }}>
                                Purchase No: {orderdetails[0].order_no || 'N/A'}
                            </Text>
                        )}

                        <View>
                            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                                <View style={{ width: '7%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12 }}>#</Text>
                                </View>

                                <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5, }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12 }}>PRODUCT</Text>
                                </View>

                                <View style={{ width: '12%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, flexDirection: 'row' }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12 }}> QTY </Text>
                                </View>

                                <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderColor: 'black', borderRightWidth: 0.5, }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12, textTransform: 'uppercase' }}>Margin</Text>
                                </View>

                                <View style={{ width: '26%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, fontSize: 12, textTransform: 'uppercase' }}>Margin after GST</Text>
                                </View>
                            </View>

                            {orderdetails && orderdetails.length > 0 ? (
                                <>
                                    {orderdetails.map((item, index) => (
                                        <View key={index}>
                                            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                {/* SR NO */}
                                                <View style={{ width: '7%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {index + 1}
                                                    </Text>
                                                </View>

                                                {/* NAME */}
                                                <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.3, }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, textTransform: 'capitalize', }} >
                                                        {item.item_name}
                                                    </Text>
                                                </View>

                                                {/* QTY */}
                                                <View style={{ width: '12%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.3, alignItems: 'center', borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {item.item_qty}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, borderBottomWidth: 0.5, borderColor: '#000' }} >
                                                        {parseFloat(item.profit_one_box).toFixed(2)}*{item.item_qty}
                                                    </Text>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {Math.round(item.total_profit_one_box)}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '26%', justifyContent: 'center', alignItems: 'center', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, borderBottomWidth: 0.5, borderColor: '#000' }} >
                                                        {parseFloat(item.gst_profit_one_box).toFixed(2)}*{item.item_qty}
                                                    </Text>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {Math.round(item.total_gst_profit_one_box)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                    {/* Total Row */}
                                    <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', borderWidth: 0.5, borderColor: 'black', }}>
                                        <View style={{ width: '7%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', padding: 3 }}></Text>
                                        </View>

                                        <View style={{ width: '30%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5 }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', padding: 3 }}>TOTAL</Text>
                                        </View>

                                        <View style={{ width: '12%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.5, alignItems: 'center', borderColor: 'black' }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', fontSize: 12 }}>
                                                {orderdetails.reduce((sum, item) => sum + (parseFloat(item.item_qty) || 0), 0)}
                                            </Text>
                                        </View>

                                        <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5 }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', padding: 3, fontSize: 12 }}>
                                                {Math.round(orderdetails.reduce((sum, item) => sum + (parseFloat(item.total_profit_one_box) || 0), 0))}
                                            </Text>
                                        </View>

                                        <View style={{ width: '26%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', padding: 3, fontSize: 12 }}>
                                                {Math.round(orderdetails.reduce((sum, item) => sum + (parseFloat(item.total_gst_profit_one_box) || 0), 0))}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            ) : null}
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View >
        // </TouchableWithoutFeedback>
    )
}

export default Purchaselist