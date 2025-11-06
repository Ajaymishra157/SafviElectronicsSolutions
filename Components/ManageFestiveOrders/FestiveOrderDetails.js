import { View, Text, FlatList, StatusBar, TouchableOpacity, Image, ActivityIndicator, Alert, Linking, Keyboard, ScrollView, TextInput, Animated, BackHandler, Modal, Dimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { height } = Dimensions.get('window');

const FestiveOrderDetails = ({ navigation, route }) => {
    const { customerid, orderdate, Remark, companyname, location_link, orderstatus, area, valuestatus, formatteddate } = route.params || {};
    const [orderdetails, setOrderDetails] = useState(null);
    const [festiveorderdetails, setFestiveorderdetails] = useState([]);
    const [usertype, setUsertype] = useState(null);
    const [mainloading, setMainloading] = useState(false);
    const [permissions, setPermissions] = useState([]);

    const [loading, setLoading] = useState(false);

    const [sendModal, setSendModal] = useState(false);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
    const [stafflist, setStafflist] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qty, setQty] = useState('');
    const [returnqty, setReturnQty] = useState('');
    const [returnqtypcs, setReturnQtyPCS] = useState('');
    const [stafforderlist, setStaffOrderList] = useState([]);
    const [availableqty, setAvailbleQty] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isReturnMode, setIsReturnMode] = useState(false);
    const [originalQty, setOriginalQty] = useState(0);

    const [orderdetailmodal, setOrderDetailModal] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [attendancestartdate, setAttendanceStartdate] = useState(null);
    const [attendanceenddate, setAttendanceEnddate] = useState(null);
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [searchText, setSearchText] = useState('');

    const formatDate = (date) => {
        if (!date) return "dd/mm/yyyy";  // default placeholder
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const displayStartDate = formatDate(startDate);
    const displayEndDate = formatDate(endDate);

    const showStartDatePicker = () => {
        setShowStartDate(true);
    };

    const showEndDatePicker = () => {
        setShowEndDate(true);
    };

    const onStartDateChange = (event, selectedDate) => {
        setShowStartDate(false);
        if (selectedDate) {
            // if no endDate yet, just set startDate
            if (!endDate || selectedDate <= endDate) {
                setStartDate(selectedDate);
            } else {
                Alert.alert("Invalid Date", "Start date cannot be after end date");
            }
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDate(false);
        if (selectedDate) {
            // if no startDate yet, just set endDate
            if (!startDate || selectedDate >= startDate) {
                setEndDate(selectedDate);
            } else {
                Alert.alert("Invalid Date", "End date cannot be before start date");
            }
        }
    };


    const formatDateToDatabase = (date) => {
        if (!date) return ""; // return empty if no date selected
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateDatabase = (date) => {
        if (!date) return null; // handle null safely
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };


    // Errors state
    const [errors, setErrors] = useState({
        staff: '',
        product: '',
        qty: '',
        returnqty: '',
    });

    const validateForm = () => {
        let valid = true;
        let newErrors = { staff: '', product: '', qty: '', returnqty: '' };

        if (!selectedStaff) {
            newErrors.staff = 'Please select staff';
            valid = false;
        }
        if (!selectedProduct) {
            newErrors.product = 'Please select product';
            valid = false;
        }
        if (!qty || parseInt(qty) <= 0) {
            newErrors.qty = 'Quantity must be greater than 0';
            valid = false;
        } else {
            const newQty = parseInt(qty) || 0;
            let maxQty = 0;

            if (isEditing || isReturnMode) {
                // restored available = API available + old assigned qty
                const product = festiveorderdetails?.find(p => p.product_id === selectedProduct);
                let availableBoxes = 0;

                if (product?.available_product_qty) {
                    // Extract number of boxes
                    const boxMatch = product.available_product_qty.match(/(\d+)\s*box/i);
                    availableBoxes = boxMatch ? Number(boxMatch[1]) : 0;
                }

                maxQty = availableBoxes + Number(originalQty || 0);
            } else {
                const product = festiveorderdetails?.find(p => p.product_id === selectedProduct);
                let availableBoxes = 0;

                if (product?.available_product_qty) {
                    const boxMatch = product.available_product_qty.match(/(\d+)\s*box/i);
                    availableBoxes = boxMatch ? Number(boxMatch[1]) : 0;
                }

                maxQty = availableBoxes;
            }

            if (newQty > maxQty) {
                newErrors.qty = `Available quantity is: ${maxQty}`;
                valid = false;
            }
        }

        // Return validation
        if (isReturnMode) {
            const returnValue = parseInt(returnqty) || 0;
            const assignedQty = Number(qty) || 0;

            if (returnValue > assignedQty) {
                newErrors.returnqty = `Return qty cannot exceed assigned qty (${assignedQty})`;
                valid = false;
            }
        }

        setErrors(newErrors);
        return valid;
    };

    const assignstocktostaff = async () => {
        if (!validateForm()) return;
        const url = `${Constant.URL}${Constant.OtherURL.add_staff_order}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                staff_id: selectedStaff,
                order_no: customerid,
                product_id: selectedProduct,
                item_qty: qty
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            liststafforders();
            fetchorderdetails();
            closeModal();
        } else {
            console.log('error while assign');
        }
    };

    const updateStaffOrder = async () => {
        if (!validateForm()) return;

        const url = `${Constant.URL}${Constant.OtherURL.update_staff_order}`;
        const response = await fetch(url, {
            method: 'POST', // most update APIs in your codebase are POST, not PUT
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: selectedOrder.id,
                staff_id: selectedStaff,
                order_no: customerid,
                product_id: selectedProduct,
                item_qty: qty,
                return_qty: returnqty,
                return_pcs: returnqtypcs
            }),
        });

        const result = await response.json();
        if (result.code == 200) {
            liststafforders();
            fetchorderdetails();
            closeModal();
        } else {
            console.log('Error while updating staff order');
        }
    };


    const openactionModal = (item, x, y) => {
        setSelectedOrder(item);
        setModalPosition({ top: y - 50, left: x - 110 });
        setModalvisible(true);
    };

    const closeModal = () => {
        setSendModal(false);
        setSelectedStaff(null);
        setSelectedProduct(null);
        setQty('');
        setIsEditing(false);
        setIsReturnMode(false);
        setErrors({ staff: '', product: '', qty: '', returnqty: '', });
    }
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // navigation.replace('OrderList', { customerid }); // Ensuring customerid is passed when going back
                navigation.reset({
                    index: 1,
                    routes: [
                        { name: 'Dashboard' },  // Keep HomeScreen in the stack
                        { name: 'FestiveOrderlist', params: { customerid, filterdate: formatteddate, filterstatus: valuestatus } }    // Navigate to Userslist
                    ],
                });
                return true; // Prevent default back behavior
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [customerid, navigation])
    );

    const listPermissions = async () => {
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
            if (result.status == "deactive") {
                Alert.alert("Access Denied", "Your account has been deactivated.");
                await AsyncStorage.clear(); // Clear stored user data
                navigation.reset({
                    index: 0,
                    routes: [{ name: "LoginUser" }]
                }); // Redirect to login
            }
            // Prepare permissions state
            let permissionsData = {};
            result.payload.forEach((item) => {
                const permsArray = item.menu_permission.split(',');
                let permsObject = {};
                permsArray.forEach((perm) => {
                    permsObject[perm] = true;
                });
                permissionsData[item.menu_name] = permsObject;
            });

            setPermissions(permissionsData);
        } else {
            console.log('Error fetching permissions');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
            fetchusertype();
            liststaffs();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            liststafforders();
        }, [startDate, endDate, attendanceenddate, attendancestartdate])
    );

    // derived filtered list
    const filteredStaffOrders = stafforderlist.filter(item =>
        item.staff_name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const liststaffs = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.list_staff}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            const formattedItems = result.payload.map((item) => ({
                label: item.staff_name,
                value: item.staff_id,
            }));
            setStafflist(formattedItems);
            if (result.start_date) {
                setAttendanceStartdate(new Date(result.start_date));
            }
            if (result.end_date) {
                setAttendanceEnddate(new Date(result.end_date));
            }

        } else if (result.code == 400) {
            if (result.start_date) {
                setAttendanceStartdate(new Date(result.start_date));
            }
            if (result.end_date) {
                setAttendanceEnddate(new Date(result.end_date));
            }
            setStafflist([]);
        } else {
            setStafflist([]);
            console.log('error while listing staff');
        }
    };

    const liststafforders = async () => {
        console.log('hhhh')
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);
        const formattedAttendanceStart = formatDateDatabase(attendancestartdate);
        const formattedAttendanceEnd = formatDateDatabase(attendanceenddate);
        const url = `${Constant.URL}${Constant.OtherURL.list_staff_order}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_no: customerid,
                start_date: formattedstartDate,
                end_date: formattedendDate,
                attendance_start_date: formattedAttendanceStart,
                attendance_end_date: formattedAttendanceEnd,
            }),
        });
        console.log('abc', formattedstartDate, formattedendDate,)
        const result = await response.json();
        if (result.code == 200) {
            setStaffOrderList(result.payload);
        } else {
            setStaffOrderList([]);
            console.log('error while listing staff stock');
        }
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

    const fetchorderdetails = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.festival_order_detail}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setFestiveorderdetails(result.payload);
            setAvailbleQty(result.available_qty)
        } else {
            console.log('error while listing product');
        }
        setMainloading(false);
    };

    const fetchorderwiselist = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.festival_order_wise_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_id: customerid,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setOrderDetails(result.payload);
        } else {
            setOrderDetails([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchorderdetails();
            fetchorderwiselist();
        }, [])
    );

    const formatOrderDate = (dateString) => {
        if (!dateString) return "00-00-0000"; // Default if no date is provided
        const date = new Date(dateString); // Convert to Date object
        const day = String(date.getDate()).padStart(2, '0'); // Get day and pad if needed
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based, add 1)
        const year = date.getFullYear(); // Get full year
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // 12 AM/PM case

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };

    const handleDelete = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.delete_staff_order}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: selectedOrder.id,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            liststafforders();
            fetchorderdetails();
        } else {
            console.log('error while delete ')
        }
        setLoading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Staff Stock",
            `Are you sure you want to delete ${selectedOrder.staff_name}'s Stock?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => handleDelete()
                }
            ]
        );
    };

    const getTotalQty = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.item_qty || 0), 0);
    };
    const getTotalreturnQty = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.return_qty || 0), 0);
    };
    const getTotalreturnQtypcs = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.return_pcs || 0), 0);
    }
    const getTotalsellQty = () => {
        let totalBox = 0;
        let totalPcs = 0;

        stafforderlist.forEach(item => {
            if (item.sell_qty) {
                // Example: "8 box ,20 pcs"
                const parts = item.sell_qty.split(','); // ["8 box ", "20 pcs"]

                parts.forEach(part => {
                    const trimmed = part.trim(); // "8 box"
                    if (trimmed.includes('box')) {
                        totalBox += Number(trimmed.replace('box', '').trim());
                    } else if (trimmed.includes('pcs')) {
                        totalPcs += Number(trimmed.replace('pcs', '').trim());
                    }
                });
            }
        });

        return { totalBox, totalPcs };
    };

    const getTotalamt = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    };
    const getTotalcash = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.cash_amount || 0), 0);
    };
    const getTotalonline = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.online_amount || 0), 0);
    };
    const getTotalbaki = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.baki_amount || 0), 0);
    };
    const getTotalloss = () => {
        return stafforderlist.reduce((sum, item) => sum + Number(item.loss_amount || 0), 0);
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity onLongPress={(e) => {
            const { pageX, pageY } = e.nativeEvent;
            openactionModal(item, pageX, pageY);
        }} style={{ flexDirection: 'row', borderWidth: 0.3, borderColor: 'black', paddingHorizontal: 5, }} >
            <Text style={{ width: 40, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {index + 1}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.staff_name}
            </Text>
            <Text style={{ width: 130, fontSize: 12, color: '#000', textAlign: 'left', paddingHorizontal: 3, textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.product_name}
            </Text>
            <Text style={{ width: 50, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.item_qty}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {[
                    item.return_qty > 0 ? `${item.return_qty} Box` : null,
                    item.return_pcs > 0 ? `${item.return_pcs} Bottle` : null
                ].filter(Boolean).join('\n')}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black', textTransform: 'capitalize' }}>
                {item.sell_qty.replace(',', ',\n')}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {formatOrderDate(item.entry_date)}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.total_amount}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.cash_amount}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.online_amount}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.baki_amount}
            </Text>
            <Text style={{ width: 80, fontSize: 12, color: '#000', textAlign: 'center', textAlignVertical: 'center', fontFamily: 'Inter-Regular', borderRightWidth: 0.3, borderColor: 'black' }}>
                {item.loss_amount}
            </Text>
        </TouchableOpacity>
    );

    if (mainloading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#173161" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <View>
                <StatusBar backgroundColor="#173161" barStyle="light-content" />
                <View style={{ backgroundColor: '#173161', flexDirection: 'row', height: 50, alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.reset({
                        index: 1,
                        routes: [
                            { name: 'Dashboard' },  // Keep HomeScreen in the stack
                            { name: 'FestiveOrderlist' }    // Navigate to Userslist
                        ],
                    })}>
                        <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
                    </TouchableOpacity>
                    <Text numberOfLines={1} style={{ width: '85%', color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 14, marginLeft: 0, textAlign: 'center' }}>{companyname}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {location_link &&
                            <TouchableOpacity onPress={() => Linking.openURL(location_link)} style={{ paddingLeft: 10, paddingVertical: 10, }}>
                                <Image source={require('../../assets/map.png')} style={{ height: 20, width: 20 }} />
                            </TouchableOpacity>}
                    </View>
                </View>
            </View>

            <View style={{ flex: 1, zIndex: 10 }}>
                <ScrollView
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#e6f0ff', paddingVertical: 10, borderRadius: 5, marginBottom: 10, marginHorizontal: 2 }}>
                        {/* <View style={{ width: '70%' }}>
                            <View style={{ paddingHorizontal: 5 }}>
                                <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                    Name:
                                    <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                        {` ${companyname}${area ? ` (${area})` : ''}`}
                                    </Text>
                                </Text>
                            </View>
                        </View> */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginRight: 5, marginLeft: 5
                        }}>
                            <View style={{ marginRight: 3 }}>
                                <Text style={{ color: '#000', fontSize: 16, fontFamily: 'Inter-Medium', textTransform: 'uppercase' }}>
                                    Avl Qty
                                </Text>
                                <Text style={{ color: '#000', fontSize: 24, fontFamily: 'Inter-Medium', textTransform: 'capitalize' }}>
                                    {availableqty}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setOrderDetailModal(true)}>
                                <Image source={require('../../assets/info.png')} style={{ height: 25, width: 25 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ alignItems: 'flex-end', marginRight: 5 }}>
                            <TouchableOpacity onPress={() => setSendModal(true)} style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center' }} >
                                <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Send to Staff</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={{ backgroundColor: '#e6f0ff', color: '#000', fontSize: 14, fontFamily: 'Inter-SemiBold', padding: 5, textAlign: 'center', marginBottom: 5 }}>Staff Stock</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5 }}>
                        {/* Start Date Button */}
                        <TouchableOpacity onPress={showStartDatePicker} style={{ backgroundColor: '#fff', width: '49%', borderWidth: 0.5, borderColor: 'gray', marginVertical: 10, borderRadius: 7, paddingHorizontal: 15, paddingVertical: 10 }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayStartDate}</Text>
                        </TouchableOpacity>

                        {/* End Date Button */}
                        <TouchableOpacity onPress={showEndDatePicker} style={{ backgroundColor: '#fff', width: '49%', borderWidth: 0.5, borderColor: 'gray', marginVertical: 10, borderRadius: 7, paddingHorizontal: 15, paddingVertical: 10 }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayEndDate}</Text>
                        </TouchableOpacity>

                        {/* Start Date Picker */}
                        {showStartDate && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                is24Hour={false}
                                display="default"
                                onChange={onStartDateChange}
                            />
                        )}

                        {/* End Date Picker */}
                        {showEndDate && (
                            <DateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                is24Hour={false}
                                display="default"
                                onChange={onEndDateChange}
                            />
                        )}
                    </View>
                    <TextInput style={{ backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'gray', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginHorizontal: 5, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular' }}
                        placeholder="Search by Staff Name"
                        placeholderTextColor="gray"
                        value={searchText}
                        onChangeText={setSearchText}
                    />

                    {stafforderlist?.length > 0 ? (
                        <View style={{ marginBottom: 10, backgroundColor: '#fff', overflow: 'hidden', }}>

                            <ScrollView keyboardShouldPersistTaps='handled' horizontal>
                                <View>
                                    {/* Header Row */}
                                    <View style={{ flexDirection: 'row', paddingHorizontal: 5, borderWidth: 0.5, }} >
                                        <Text style={{ width: 40, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            #
                                        </Text>
                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Staff
                                        </Text>
                                        <Text style={{ width: 130, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Product
                                        </Text>
                                        <Text style={{ width: 50, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Qty
                                        </Text>
                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Return
                                        </Text>
                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Sell
                                        </Text>
                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Date
                                        </Text>

                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Total Amt
                                        </Text>

                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Cash Amt
                                        </Text>

                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            UPI Amt
                                        </Text>

                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Baki Amt
                                        </Text>

                                        <Text style={{ width: 80, paddingVertical: 5, fontSize: 14, color: '#000', fontFamily: 'Inter-SemiBold', textAlign: 'center', borderRightWidth: 0.5, borderColor: '#000' }}>
                                            Loss Amt
                                        </Text>
                                    </View>

                                    {/* Data Rows */}
                                    <FlatList
                                        data={filteredStaffOrders}
                                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                                        renderItem={renderItem}
                                        ListFooterComponent={() => (
                                            <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: 'black', paddingHorizontal: 5, backgroundColor: '#f2f2f2' }}>
                                                <Text style={{ width: 250, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    Total
                                                </Text>
                                                <Text style={{ width: 50, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    {getTotalQty()}
                                                </Text>

                                                <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    {getTotalreturnQty() > 0 && `${getTotalreturnQty()} Box`}
                                                    {getTotalreturnQty() > 0 && getTotalreturnQtypcs() > 0 ? '\n' : ''}
                                                    {getTotalreturnQtypcs() > 0 && `${getTotalreturnQtypcs()} Bottle`}
                                                </Text>

                                                <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    {getTotalsellQty().totalBox > 0 && `${getTotalsellQty().totalBox} Box`}
                                                    {getTotalsellQty().totalBox > 0 && getTotalsellQty().totalPcs > 0 ? '\n' : ''}
                                                    {getTotalsellQty().totalPcs > 0 && `${getTotalsellQty().totalPcs} Bottle`}
                                                </Text>
                                                <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                </Text>
                                                <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    {getTotalamt()}
                                                </Text>
                                                <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    {getTotalcash()}
                                                </Text>
                                                <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    {getTotalonline()}
                                                </Text>
                                                <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    {getTotalbaki()}
                                                </Text>
                                                <Text style={{ width: 80, paddingVertical: 4, fontSize: 13, fontFamily: 'Inter-SemiBold', textAlignVertical: 'center', color: '#000', textAlign: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                    {getTotalloss()}
                                                </Text>
                                            </View>
                                        )}
                                    />
                                </View>
                            </ScrollView>
                        </View>
                    ) :
                        <View style={{ alignItems: 'center', marginTop: 30 }}>
                            <Text style={{ fontFamily: 'Inter-Medium', color: '#173161', fontSize: 14 }}>No Staff Orders Available</Text>
                        </View>
                    }
                </ScrollView>
            </View>

            <Modal
                visible={sendModal}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                {/* Overlay */}
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={closeModal} // close modal on outside tap
                >
                    {/* Modal content wrapper */}
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            marginHorizontal: 20,
                            borderRadius: 10,
                            width: '90%',
                        }}
                        onPress={() => { }} // do nothing to prevent closing on inside tap
                    >
                        <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', marginBottom: 10, color: '#173161' }}>
                            Assign Product to Staff
                        </Text>

                        {/* Staff Dropdown */}
                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                            Staff
                        </Text>
                        <Dropdown
                            data={stafflist}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Staff"
                            placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}
                            selectedTextStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}
                            value={selectedStaff}
                            onChange={item => {
                                setSelectedStaff(item.value);
                                setErrors(prev => ({ ...prev, staff: '' }));
                            }}
                            style={{
                                height: 50,
                                borderColor: errors.staff ? 'red' : 'gray',
                                borderWidth: 0.5,
                                borderRadius: 5,
                                paddingHorizontal: 15,
                                marginBottom: 5,
                                backgroundColor: isReturnMode ? '#f0f0f0' : '#fff'
                            }}
                            renderItem={item => {
                                const isSelected = item.value === selectedStaff;
                                return (
                                    <View style={{ padding: 8, paddingHorizontal: 12, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                                        <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}>
                                            {item.label}
                                        </Text>
                                    </View>
                                );
                            }}
                            disable={isReturnMode}
                        />
                        {errors.staff ? <Text style={{ color: 'red', marginBottom: 8 }}>{errors.staff}</Text> : null}

                        {/* Product Dropdown */}
                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                            Product
                        </Text>
                        <Dropdown
                            data={
                                festiveorderdetails?.map(p => {
                                    // Parse available quantity
                                    const availableStr = p.available_product_qty || "0";

                                    // If editing or in return mode, adjust by original quantity
                                    let adjustedQty = availableStr;
                                    if ((isEditing || isReturnMode) && p.product_id == selectedProduct) {
                                        // Add originalQty only if needed, maybe show as a string too
                                        adjustedQty = `${availableStr} + ${originalQty || 0}`;
                                    }

                                    return {
                                        label: `${p.item_name} (Available: ${adjustedQty})`,
                                        value: p.product_id,
                                    };
                                }) || []
                            }
                            labelField="label"
                            valueField="value"
                            placeholder="Select Product"
                            placeholderStyle={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular' }}
                            selectedTextStyle={{ fontSize: 12, color: '#000', fontFamily: 'Inter-Regular' }}
                            value={selectedProduct}
                            onChange={item => {
                                setSelectedProduct(item.value);
                                setErrors(prev => ({ ...prev, product: '' }));
                            }}
                            style={{ height: 50, borderColor: errors.product ? 'red' : 'gray', borderWidth: 0.5, borderRadius: 5, paddingHorizontal: 15, marginBottom: 5, backgroundColor: isReturnMode ? '#f0f0f0' : '#fff', }}
                            renderItem={item => {
                                const isSelected = item.value === selectedProduct;
                                return (
                                    <View style={{ padding: 8, paddingHorizontal: 12, backgroundColor: isSelected ? '#e6f0ff' : '#fff', borderRadius: 5, }} >
                                        <Text style={{ fontSize: 14, color: '#000', fontFamily: 'Inter-Regular', }}>
                                            {item.label}
                                        </Text>
                                    </View>
                                );
                            }}
                            disable={isReturnMode}
                        />
                        {errors.product ? <Text style={{ color: 'red', marginBottom: 8 }}>{errors.product}</Text> : null}

                        {/* Qty Input */}
                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                            Quantity
                        </Text>
                        <TextInput style={{ borderWidth: 1, borderRadius: 5, padding: 10, borderColor: errors.qty ? 'red' : 'gray', marginBottom: 5, color: '#000', fontFamily: 'Inter-Regular', backgroundColor: isReturnMode ? '#f0f0f0' : '#fff' }}
                            placeholder="Enter Quantity"
                            placeholderTextColor={'gray'}
                            keyboardType="numeric"
                            value={qty}
                            editable={!isReturnMode}
                            onChangeText={text => {
                                setQty(text);
                                setErrors(prev => ({ ...prev, qty: '' }));
                            }}
                        />
                        {errors.qty ? <Text style={{ color: 'red', marginBottom: 8 }}>{errors.qty}</Text> : null}

                        {isReturnMode && (
                            <>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                                            Return Box
                                        </Text>
                                        <TextInput style={{ width: '90%', borderWidth: 1, borderRadius: 5, padding: 10, borderColor: errors.returnqty ? 'red' : 'gray', marginBottom: 5, color: '#000', fontFamily: 'Inter-Regular' }}
                                            placeholder="Enter box"
                                            placeholderTextColor={'gray'}
                                            keyboardType="numeric"
                                            value={returnqty}
                                            onChangeText={text => {
                                                setReturnQty(text);
                                                setErrors(prev => ({ ...prev, returnqty: '' }));
                                            }}
                                        />
                                        {errors.returnqty ? <Text style={{ color: 'red', marginBottom: 8 }}>{errors.returnqty}</Text> : null}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: 'gray', marginLeft: 5 }}>
                                            Return Bottle
                                        </Text>
                                        <TextInput style={{ width: '90%', borderWidth: 1, borderRadius: 5, padding: 10, borderColor: 'gray', marginBottom: 5, color: '#000', fontFamily: 'Inter-Regular' }}
                                            placeholder="Enter pcs"
                                            placeholderTextColor={'gray'}
                                            keyboardType="numeric"
                                            value={returnqtypcs}
                                            onChangeText={text => {
                                                setReturnQtyPCS(text);
                                            }}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 }}>
                            <TouchableOpacity onPress={closeModal} style={{ backgroundColor: '#e60000', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, }}>
                                <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Medium' }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={(isEditing || isReturnMode) ? updateStaffOrder : assignstocktostaff} style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, }} >
                                <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>
                                    Save
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ position: 'absolute', top: modalPosition.top, left: modalPosition.left, gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10, }} >
                        <TouchableOpacity onPress={() => {
                            setIsEditing(true);
                            setIsReturnMode(false);
                            setSelectedStaff(selectedOrder.staff_id);
                            setSelectedProduct(selectedOrder.product_id);
                            setQty(selectedOrder.item_qty.toString());
                            setReturnQty(selectedOrder.return_qty?.toString() || '');
                            setReturnQtyPCS(selectedOrder.return_pcs?.toString() || '');
                            setOriginalQty(Number(selectedOrder.item_qty));

                            setSendModal(true); // open assign modal prefilled
                            setModalvisible(false);
                        }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                        </TouchableOpacity>
                        {/* Return Option */}
                        <TouchableOpacity
                            onPress={() => {
                                setIsEditing(false);
                                setIsReturnMode(true);
                                setSelectedStaff(selectedOrder.staff_id);
                                setSelectedProduct(selectedOrder.product_id);
                                setQty(selectedOrder.item_qty.toString());
                                setReturnQty(selectedOrder.return_qty); // fresh return entry
                                setReturnQtyPCS(selectedOrder.return_pcs?.toString() || '');
                                setOriginalQty(Number(selectedOrder.item_qty));
                                setSendModal(true); setModalvisible(false);
                            }}
                            style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
                        >
                            <Icon name="backup-restore" size={20} color="#173161" />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Return</Text>
                        </TouchableOpacity>

                        {/* Payment Option */}
                        <TouchableOpacity
                            onPress={() => { navigation.navigate("FestiveOrderPayment", { selectedOrder: selectedOrder }); setModalvisible(false); }}
                            style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}
                        >
                            <MaterialIcons name="payment" size={20} color="#173161" />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Payment</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* order details modal */}
            <Modal visible={orderdetailmodal} transparent={true} animationType="slide">
                <TouchableOpacity
                    onPress={() => setOrderDetailModal(false)}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ maxHeight: height * 0.9, backgroundColor: '#fff', paddingHorizontal: 10, marginHorizontal: 5, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 0.5, borderColor: '#ccc', marginBottom: 5 }}>
                            <Text style={{ color: '#000', fontSize: 16, marginBottom: 5, fontFamily: 'Inter-Bold' }}>Order Details </Text>
                            <TouchableOpacity
                                onPress={() => setOrderDetailModal(false)}
                                style={{ padding: 5 }}
                            >
                                <MaterialIcons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flexGrow: 0 }} // prevents ScrollView from taking full height
                            contentContainerStyle={{ flexGrow: 1 }}>

                            {festiveorderdetails && festiveorderdetails.length > 0 && (
                                <>
                                    <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textAlign: 'center' }}>Available Box Summary</Text>
                                    <View style={{ backgroundColor: '#eee', marginBottom: 10, borderWidth: 0.5, }}>
                                        {/* Table Header */}

                                        <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: 'black' }}>
                                            <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}>#</Text>
                                            </View>
                                            <View style={{ width: '55%', justifyContent: 'center', alignItems: 'flex-start', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}>PRODUCT</Text>
                                            </View>
                                            <View style={{ width: '35%', justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase' }}>Available QTY</Text>
                                            </View>
                                        </View>

                                        {/* Products */}
                                        {festiveorderdetails.map((item, index) => (
                                            <View key={index} style={{ flexDirection: 'row', borderWidth: 0.3, borderColor: 'black' }}>
                                                <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black' }}>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12 }}>{index + 1}</Text>
                                                </View>
                                                <View style={{ width: '55%', justifyContent: 'center', alignItems: 'flex-start', borderRightWidth: 0.3, borderColor: 'black' }}>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, textTransform: 'capitalize' }}>{item.item_name}</Text>
                                                </View>
                                                <View style={{ width: '35%', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, textTransform: 'capitalize' }}>{item.available_product_qty}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            )}

                            {orderdetails && orderdetails.length > 0 ? orderdetails.map((order, orderIndex) => {
                                // Calculate totals for this order safely
                                const totalQty = Array.isArray(order.product)
                                    ? order.product.reduce((sum, item) => sum + Number(item.item_qty), 0)
                                    : 0;

                                const grandTotal = Array.isArray(order.product)
                                    ? order.product.reduce((sum, item) => sum + Number(item.total_price), 0)
                                    : 0;


                                return (
                                    <View key={orderIndex} style={{ marginBottom: 15, backgroundColor: orderIndex % 2 == 0 ? '#e6f0ff' : '#fff', borderWidth: 0.5, borderRadius: 5, borderColor: '#000' }}>
                                        <View style={{ paddingHorizontal: 5, marginBottom: 5, paddingTop: 5 }}>
                                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                                Order Date:
                                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}> {formatOrderDate(order.order_date)}</Text>
                                            </Text>

                                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                                Order No:
                                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                                    {` ${order.order_no}`}
                                                </Text>
                                            </Text>

                                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                                Total Amount:
                                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                                    {` ${order.total_price}`}
                                                </Text>
                                            </Text>

                                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                                Order Created By:
                                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                                    {` ${order.user_name}`}
                                                </Text>
                                            </Text>
                                        </View>

                                        {/* Table Header */}
                                        <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: 'black' }}>
                                            <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black' }}>
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}>#</Text>
                                            </View>
                                            <View style={{ width: '35%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5 }}>
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}>PRODUCT</Text>
                                            </View>
                                            <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5 }}>
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}>QTY</Text>
                                            </View>
                                            <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5 }}>
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase' }}>RATE</Text>
                                            </View>
                                            <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black' }}>
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}>TOTAL</Text>
                                            </View>
                                        </View>

                                        {/* Products */}
                                        {order.product.map((item, index) => (
                                            <View key={index}>
                                                <View style={{ flexDirection: 'row', borderWidth: 0.3, borderColor: 'black' }}>
                                                    <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black' }}>
                                                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12 }}>{index + 1}</Text>
                                                    </View>
                                                    <View style={{ width: '35%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.3 }}>
                                                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, textTransform: 'capitalize' }}>{item.item_name}</Text>
                                                    </View>
                                                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.3 }}>
                                                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>{item.item_qty}</Text>
                                                    </View>
                                                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.3 }}>
                                                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12 }}>{item.item_price}</Text>
                                                    </View>
                                                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12 }}>{Math.round(item.total_price)}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}

                                        {/* Footer for this order */}
                                        <View>
                                            <View style={{ flexDirection: 'row', borderWidth: 0.3, borderColor: 'black' }}>
                                                <View style={{ width: '45%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black' }}>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12 }}>Total</Text>
                                                </View>
                                                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black' }}>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>{totalQty}</Text>
                                                </View>
                                                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black' }}>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12 }}></Text>
                                                </View>
                                                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12 }}>{grandTotal}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )
                            }) : (
                                <Text>No orders found</Text>
                            )}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

        </View>
    )
}
export default FestiveOrderDetails