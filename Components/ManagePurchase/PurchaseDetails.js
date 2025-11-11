import { View, Text, FlatList, StatusBar, TouchableOpacity, Image, ActivityIndicator, Modal, Alert, Linking, Keyboard, ScrollView, TextInput, Animated, BackHandler, Dimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

const PurchaseDetails = ({ navigation, route }) => {
    const { order_no, orderdate, Remark, companyname, location_link, orderstatus, area, valuestatus, formatteddate, from, searchTerm } = route.params || {};

    const [orderdetails, setOrderDetails] = useState(null);
    const [usertype, setUsertype] = useState(null);
    const [mainloading, setMainloading] = useState(false);
    const [paid, setPaid] = useState(null);
    const [due, setDue] = useState(null);
    const [totalamt, setTotalamt] = useState(null);
    const [totaldueamt, setTotaldueamt] = useState(null);
    const [permissionlist, setPermissionsList] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [modalvisible, setModalvisible] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const [paymentmodal, setPaymentModal] = useState(false);
    const [paymentmodalposition, setPaymentModalposition] = useState({ top: 0, left: 0 });
    const [selectedpaymentid, setSelectedpaymentid] = useState(null);
    const [selectedentry, setSelectedEntry] = useState(null);
    const [isupdatemode, setIsupdatemode] = useState(false);

    const [remark, setRemark] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customerId, setCustomerId] = useState(null);
    const [paymentlist, setPaymentlist] = useState([]);

    const [paidamt, setPaidamt] = useState(null);
    const [amount, setAmount] = useState(null);
    const [QRErrors, setQRErrors] = useState({});
    const [paymentmethodopen, setPaymentMethodOpen] = useState(false); // Controls dropdown visibility
    const [paymentmethodvalue, setPaymentMethodValue] = useState(); // Selected payment method
    const [paymentmethoditems, setPaymentMethodItems] = useState([
        { label: 'Cash', value: 'Cash' },
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'Baki', value: 'Baki' },
        { label: "UPI", value: "UPI" },
    ]);

    const [isExpanded, setIsExpanded] = useState(false);
    const [paydueamt, setPaydueamt] = useState({});
    const [paydueamtmethodopen, setPaydueamtMethodOpen] = useState({}); // Controls dropdown visibility
    const [paydueamtmethodvalue, setPaydueamtMethodValue] = useState({}); // Selected payment method
    const [paydueamtmethoditems, setPaydueamtMethodItems] = useState([]);
    const [duepaymentlist, setDuepaymentlist] = useState([]);

    const [transport_amt, setTransport_amt] = useState(null);
    const [transportmodal, setTransportmodal] = useState(null);
    const [transportpayopen, setTransportpayOpen] = useState(false);
    const [transportpayvalue, setTransportpayValue] = useState(null)
    const [transportpayitems, setTransportpayItems] = useState([
        { label: 'Cash', value: 'Cash' },
        { label: 'Bank Transfer', value: 'Bank Transfer' },
        { label: 'Baki', value: 'Baki' },
        { label: "UPI", value: "UPI" },
    ]);
    const [transport_remark, setTransport_remark] = useState(null);
    const [transportpaymode, setTransportpayMode] = useState(null);
    const [trasportpaystatus, setTransportpaystatus] = useState(null);

    const [statusopen, setStatusOpen] = useState(false); // Controls dropdown visibility
    const [statusvalue, setStatusValue] = useState('Delivered'); // Selected payment method
    const [statusitems, setStatusItems] = useState([
        { label: 'Delivered', value: 'Delivered' },
    ]);

    const [upilist, setUpiList] = useState([]);
    const [upiModalVisible, setUpiModalVisible] = useState(false);
    const [selectedupiid, setSelectedUpiId] = useState(null);
    const [upilink, setUpilink] = useState(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const [selectedUpiImage, setSelectedUpiImage] = useState(null);

    const [creadibalance, setCreditbalance] = useState(null);
    const [creditmodal, setCreditModal] = useState(false);
    const [redeemamt, setRedeemamt] = useState(null);
    const [redeemError, setRedeemError] = useState('');
    const [totalpaybleamount, setTotalpaybleamount] = useState(null);
    const [orderstatusfetch, setOrderStatusfetch] = useState(null);

    const [errors, setErrors] = useState({
        paidamt: '',
        method: '',
        status: '',
    });

    const showRate = !permissions?.["Order Price"]?.["Show Rate"];
    const showTotal = !permissions?.["Order Price"]?.["Show Total"];
    // const showMargin = !permissions?.["Show Margin"];

    const getDynamicColumns = () => {
        const baseColumns = [
            { key: 'sr', label: '#', width: 40 },
            { key: 'product', label: 'PRODUCT', width: 120 },
            { key: 'qty', label: 'QTY', width: 70 },
        ];

        const priceColumns = [];
        if (showRate) priceColumns.push({ key: 'rate', label: 'RATE', width: 80 });
        if (showTotal) priceColumns.push({ key: 'total', label: 'TOTAL', width: 80 });

        // Margin columns ko completely remove karein
        let columns = [...baseColumns, ...priceColumns];

        // Dynamic width calculation
        const indexWidth = screenWidth * 0.15;
        const restWidth = screenWidth - indexWidth;

        const visibleColumns = columns.filter(col => col.key !== 'sr');

        const weightMap = visibleColumns.reduce((acc, col) => {
            acc[col.key] = col.key === 'product' ? 2 : 1;
            return acc;
        }, {});

        const totalWeight = Object.values(weightMap).reduce((a, b) => a + b, 0);

        columns = columns.map(col => {
            if (col.key === 'sr') {
                return { ...col, width: indexWidth };
            }

            const weight = weightMap[col.key] || 1;
            const colWidth = (restWidth * weight) / totalWeight;

            return { ...col, width: colWidth };
        });

        return columns;
    };

    const columns = getDynamicColumns();

    const validateFields = () => {
        const grandTotal = totalpaybleamount ? totalpaybleamount : calculateGrandTotal();
        const newErrors = {};

        const paymentItem = paymentlist && paymentlist.length > 0 ? paymentlist[0] : null;

        // Prevent 0 amount when payment method is Cash or Bank Transfer
        if (paymentmethodvalue == 'Cash' || paymentmethodvalue == 'Bank Transfer') {
            if (!paidamt || parseFloat(paidamt) <= 0) {
                newErrors.paidamt = 'Payment amount must be greater than 0';
            } else if (paymentItem && paymentItem.deu_amount) {
                newErrors.paidamt = paidamt > paymentItem.deu_amount ? 'Due amount is less than the entered amount' : '';
            } else {
                newErrors.paidamt = grandTotal < paidamt ? 'Due amount is less than the entered amount' : '';
            }
        }

        if (paymentmethodvalue == 'UPI') {
            if (!paidamt || parseFloat(paidamt) <= 0) {
                newErrors.paidamt = 'Payment amount must be greater than 0';
            } else {
                const selectedUpi = upilist.find((item) => item.upi_id == selectedupiid);
                if (selectedUpi) {
                    const limit = parseFloat(selectedUpi.upi_limit);
                    if (parseFloat(paidamt) > limit) {
                        newErrors.paidamt = `Amount exceeds UPI limit of ₹${limit}`;
                    }
                } else {
                    newErrors.paidamt = 'Please select a UPI ID';
                }
            }
        }

        // Validate other fields
        newErrors.method = paymentmethodvalue ? '' : 'Payment method is required';
        newErrors.status = statusvalue ? '' : 'Order Status is required';

        setErrors(newErrors);

        return Object.values(newErrors).every((error) => error == '');
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // navigation.replace('OrderList', { order_no }); // Ensuring order_no is passed when going back
                if (from == 'margin') {
                    navigation.goBack();
                } else {
                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: 'Dashboard' },  // Keep HomeScreen in the stack
                            { name: 'Purchaselist', params: { order_no, filterdate: formatteddate, filterstatus: valuestatus, filtertext: searchTerm } }    // Navigate to Userslist
                        ],
                    });
                }
                return true; // Prevent default back behavior
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [order_no, navigation])
    );

    useEffect(() => {
        if (paymentmethodvalue == 'Baki') {
            setPaidamt('0'); // Set amount to 0 when 'Baki' is selected
        }
    }, [paymentmethodvalue]);

    // const listupi = async () => {
    //     const url = `${Constant.URL}${Constant.OtherURL.list_upi}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({

    //         }),
    //     });
    //     const result = await response.json();
    //     if (result.code == "200") {
    //         setUpiList(result.payload);
    //     } else {
    //         setUpiList([]);
    //         console.log('error while listing upi');
    //     }
    // };

    const [expandedIndex, setExpandedIndex] = useState(null);
    const animations = useRef({}).current; // Store animated values for each index

    const handleToggleExpand = (index) => {
        if (!animations[index]) {
            animations[index] = new Animated.Value(0); // Initialize animation if not set
        }

        if (expandedIndex == index) {
            Animated.timing(animations[index], {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => setExpandedIndex(null));
        } else {
            if (expandedIndex != null && animations[expandedIndex]) {
                Animated.timing(animations[expandedIndex], {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            }

            setExpandedIndex(index);
            Animated.timing(animations[index], {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    };

    // const listPermissions = async () => {
    //     const id = await AsyncStorage.getItem('admin_id');

    //     const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ user_id: id }),
    //     });
    //     const result = await response.json();
    //     if (result.code == "200") {
    //         if (result.status == "deactive") {
    //             Alert.alert("Access Denied", "Your account has been deactivated.");
    //             await AsyncStorage.clear(); // Clear stored user data
    //             navigation.reset({
    //                 index: 0,
    //                 routes: [{ name: "LoginUser" }]
    //             }); // Redirect to login
    //         }
    //         setPermissionsList(result.payload);
    //         // Prepare permissions state
    //         let permissionsData = {};
    //         result.payload.forEach((item) => {
    //             const permsArray = item.menu_permission.split(',');
    //             let permsObject = {};
    //             permsArray.forEach((perm) => {
    //                 permsObject[perm] = true;
    //             });
    //             permissionsData[item.menu_name] = permsObject;
    //         });

    //         setPermissions(permissionsData);
    //     } else {
    //         console.log('Error fetching permissions');
    //     }
    // };

    // useFocusEffect(
    //     React.useCallback(() => {

    //         fetchusertype();
    //         listupi();
    //         listpayments();
    //     }, [])
    // );

    const hasCategoryPermissions = permissions['Orders'] || {};
    const hasPermissions = permissions['Customers'] || {};

    // const fetchusertype = async () => {
    //     setLoading(true);
    //     const id = await AsyncStorage.getItem('admin_id');

    //     const url = `${Constant.URL}${Constant.OtherURL.fetch_usertype}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ user_id: id }),
    //     });
    //     const result = await response.json();
    //     if (result.code == "200") {
    //         setUsertype(result.payload.user_type)
    //     } else {
    //         console.log('Error fetching permissions');
    //     }
    //     setLoading(false);
    // };

    const [error, setError] = useState(null);

    // const paytransportcharge = async () => {
    //     if (!transportpayvalue) {
    //         setError('Payment mode is required');
    //         return;
    //     }
    //     setLoading(true);
    //     const transportpaylabel = transportpayitems.find(item => item.value == transportpayvalue)?.label || '';

    //     const url = `${Constant.URL}${Constant.OtherURL.transport_charge_add}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             order_no: order_no,
    //             payment_mode: transportpaylabel,
    //             payment_status: 'Paid'
    //         }),
    //     });
    //     const result = await response.json();
    //     if (result.code == "200") {
    //         fetchorderdetails();
    //         setTransportmodal(false);
    //         setTransportpayValue(null);
    //     } else {
    //         console.log('Error fetching permissions');
    //     }
    //     setLoading(false);
    // };

    // const fetcholdduepayments = async () => {
    //     setLoading(true);
    //     const url = `${Constant.URL}${Constant.OtherURL.old_due_payment}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ customer_id: customerId, order_no: order_no }),
    //     });
    //     const result = await response.json();
    //     if (result.code == "200") {
    //         setDuepaymentlist(result.payload)
    //     } else {
    //         setDuepaymentlist([]);
    //         console.log('Error fetching old payment list');
    //     }
    //     setLoading(false);
    // };

    const [oldpayerrors, setOldpayErrors] = useState({});

    const validatePayment = (order_no, dueAmount) => {
        let valid = true;
        let newErrors = {};

        if (!paydueamtmethodvalue[order_no]) {
            newErrors.method = "Please select a payment method.";
            valid = false;
        }

        if (!paydueamt[order_no] || isNaN(paydueamt[order_no]) || parseFloat(paydueamt[order_no]) <= 0) {
            newErrors.paydueamt = "Enter a valid amount.";
            valid = false;
        } else if (parseFloat(paydueamt[order_no]) > dueAmount) {
            newErrors.paydueamt = "Amount cannot exceed due amount.";
            valid = false;
        }

        setOldpayErrors(prev => ({ ...prev, [order_no]: newErrors }));
        return valid;
    };

    // const addoldpayment = async (order_no, dueAmount) => {
    //     if (!validatePayment(order_no, dueAmount)) {
    //         return;
    //     }
    //     setMainloading(true);
    //     const id = await AsyncStorage.getItem('admin_id');
    //     const paymentMethodLabel = paydueamtmethoditems?.find(item => item.value == paydueamtmethodvalue[order_no])?.label || '';

    //     const url = `${Constant.URL}${Constant.OtherURL.payment}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             c_id: customerId,
    //             user_id: id,
    //             order_no: order_no,
    //             payment_amount: paydueamt[order_no],
    //             payment_mode: paymentMethodLabel,
    //             remark: '',
    //             status: 'Delivered',
    //         }),
    //     });
    //     const result = await response.json();
    //     if (result.code == "200") {
    //         setPaydueamt((prev) => ({ ...prev, [order_no]: '' }));
    //         setPaydueamtMethodValue((prev) => ({ ...prev, [order_no]: null }));
    //         fetcholdduepayments();
    //         fetchorderdetails();
    //     } else {
    //         //   setOrderDetails([]);
    //         console.log('error while adding old payment');
    //     }
    //     setMainloading(false);
    // };

    // useFocusEffect(
    //     React.useCallback(() => {
    //         fetcholdduepayments();
    //     }, [customerId])
    // );

    const fetchorderdetails = async () => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.confirmlist_purchase}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                purchase_no: order_no,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setOrderDetails(result.payload);
            setRemark(result.remark);
            setPaid(result.payment_amount);
            setDue(result.due_amount);
            setTotalamt(result.total_price);
            setTotaldueamt(result.total_due);
            setTransport_amt(result.transport_price);
            setTransport_remark(result.transport_remark);
            setTransportpayMode(result.transport_pay);
            setTransportpaystatus(result.payment_status);
            setCreditbalance(result.customer_commission);
            setCustomerId(result.payload[0].customer_id);
            setOrderStatusfetch(result.order_status);
            const paymentOptions = result.payment_mode.map(mode => ({
                label: mode.charAt(0).toUpperCase() + mode.slice(1), // Capitalize first letter
                value: mode
            }));
            // setPaymentMethodItems(paymentOptions);
            // await filterPaymentMethods(paymentOptions);
        } else {
            //   setOrderDetails([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };

    // const filterPaymentMethods = async (paymentOptions) => {
    //     const id = await AsyncStorage.getItem('admin_id');

    //     const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
    //     const response = await fetch(url, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ user_id: id }),
    //     });
    //     const result = await response.json();

    //     if (result.code == "200") {
    //         const permissionsList = result.payload;

    //         // Find payment type permissions
    //         const paymentTypePermission = permissionsList.find(item => item.menu_name == "Payment Type");
    //         let allowedPayments = paymentTypePermission ? paymentTypePermission.menu_permission.split(',').map(p => p.trim().toLowerCase()) : [];
    //         console.log("abc", allowedPayments);


    //         // If UPI is in the list but no UPI ID is available, remove it from allowedPayments
    //         const hasUpiPermission = allowedPayments.includes("Upi");
    //         console.log(hasUpiPermission);
    //         console.log(upilist);
    //         if (hasUpiPermission && (!upilist || upilist.length == 0)) {
    //             allowedPayments = allowedPayments.filter(p => p != "Upi");
    //         }

    //         // Filter payment options based on allowed permissions
    //         const filteredPaymentOptions = paymentOptions.filter(option => allowedPayments.includes(option.value.toLowerCase()));
    //         console.log(filteredPaymentOptions);

    //         setPaymentMethodItems(filteredPaymentOptions);
    //         const paydueamtFiltered = filteredPaymentOptions.filter(option => option.value != "Baki");
    //         setPaydueamtMethodItems(paydueamtFiltered);
    //         setTransportpayItems(paydueamtFiltered);
    //     } else {
    //         console.log('Error fetching permissions for filtering payment options');
    //     }
    // };
    useFocusEffect(
        React.useCallback(() => {
            fetchorderdetails();
        }, [])
    );

    const calculateGrandTotal = () => {
        return orderdetails.reduce((total, item) => total + Math.round(parseFloat(item.total_price)), 0);
    };

    const calculateTotalQty = () => {
        return orderdetails.reduce((total, item) => total + Math.round(parseFloat(item.item_qty)), 0);
    };

    // const calculateTotalMarginBox = () =>
    //     orderdetails.reduce((sum, item) => sum + Number(item.profit_one_box || 0), 0);

    // const calculateTotalMargin = () =>
    //     orderdetails.reduce((sum, item) => sum + Math.round(item.total_profit_one_box || 0), 0);

    // const calculateTotalMarginGstBox = () =>
    //     orderdetails.reduce((sum, item) => sum + Number(item.gst_profit_one_box || 0), 0);

    // const calculateTotalMarginGst = () =>
    //     orderdetails.reduce((sum, item) => sum + Math.round(item.total_gst_profit_one_box || 0), 0);

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
        const url = `${Constant.URL}${Constant.OtherURL.alldelete_confirmpurchase}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                purchase_no: order_no,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            closeModal();
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'Dashboard' },  // Keep HomeScreen in the stack
                    { name: 'Purchaselist' }    // Navigate to Userslist
                ],
            });
        } else {
            // Handle error if needed
        }
        setMainloading(false);
    };

    const confirmDelete = () => {
        Alert.alert(
            "Delete Order",
            `Are you sure you want to delete this Purchase?`,
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

    const openModal = (x, y) => {
        setModalPosition({ top: y - 15, left: x - 120 });
        // setSelectedUser(item.user_name);
        // setselecteduserid(item.userid);
        // setSelecteduserdata(item);
        setModalvisible(true);
    };

    const closeModal = () => {
        setModalvisible(false);
    };

    const handleEdit = () => {
        if (orderdetails) {
            navigation.replace('CreatePurchase', {
                companyname: companyname,
                order_no: order_no,
                orderdate: orderdate,
                customerid: orderdetails[0].customer_id,
                fetchremark: remark,
                area: area,
                orderstatus: orderstatusfetch,
            });
            setModalvisible(false);
        }
    };

    const openpaymentModal = (item, x, y) => {
        setPaymentModalposition({ top: y - 15, left: x - 110 });
        setSelectedEntry(item);
        setSelectedpaymentid(item.payment_id)
        // setSelectedUser(item.user_name);
        // setselecteduserid(item.userid);
        // setSelecteduserdata(item);
        setPaymentModal(true);
    };

    const handleEditpayment = () => {
        if (selectedentry) {
            setPaymentMethodValue(selectedentry.payment_mode); // Now store the payment mode
            setPaidamt(selectedentry.paid_amount);
            setIsupdatemode(true);
        }
        setPaymentModal(false); // Close modal
    };

    const addpayment = async () => {
        if (!validateFields()) return;
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const paymentMethodLabel = paymentmethoditems.find(item => item.value == paymentmethodvalue)?.label || '';

        // Find label for selected status
        const statusLabel = statusitems.find(item => item.value == statusvalue)?.label || '';
        const url = `${Constant.URL}${Constant.OtherURL.payment}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                c_id: customerId,
                user_id: id,
                order_no: order_no,
                payment_amount: paidamt,
                payment_mode: paymentMethodLabel,
                remark: '',
                status: statusLabel,
                upi_id: selectedupiid,
                redeem_commission: redeemamt
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setPaidamt(null);
            setAmount(null);
            setRedeemamt(null);
            setPaymentMethodValue(null);
            setSelectedUpiId(null);
            setUpilink(null);
            listpayments();
            fetchorderdetails();
            listupi();
        } else {
            //   setOrderDetails([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };

    const updatepayment = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const paymentMethodLabel = paymentmethoditems.find(item => item.value == paymentmethodvalue)?.label || '';

        // Find label for selected status
        const statusLabel = statusitems.find(item => item.value == statusvalue)?.label || '';
        const url = `${Constant.URL}${Constant.OtherURL.update_payment}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payment_id: selectedpaymentid,
                c_id: customerId,
                user_id: id,
                order_no: order_no,
                payment_amount: paidamt,
                payment_mode: paymentMethodLabel,
                remark: '',
                status: statusLabel,
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setPaidamt(null);
            setPaymentMethodValue(null);
            listpayments();
            fetchorderdetails();
            setIsupdatemode(false);
        } else {
            //   setOrderDetails([]);
            console.log('error while listing product');
        }
        setMainloading(false);
    };

    const listpayments = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.payment_list}`;
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
            setPaymentlist(result.payload);

        } else {
            setPaymentlist([]);
            console.log('error while listing payment');
        }
    };

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
                    <TouchableOpacity onPress={() => {
                        if (from == 'margin') {
                            navigation.goBack();
                        } else {
                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'Dashboard' },  // Keep HomeScreen in the stack
                                    {
                                        name: 'Purchaselist',
                                        //  params: { order_no, filterdate: formatteddate, filterstatus: valuestatus } 
                                    }    // Navigate to Userslist
                                ],
                            });
                        }
                    }}>
                        <Image source={require('../../assets/arrow_back.png')} style={{ marginLeft: 10, height: 25, width: 25 }} />
                    </TouchableOpacity>
                    <Text style={{ color: '#FFF', fontFamily: 'Inter-Bold', fontSize: 16, marginLeft: 0 }}>Purchase Detaills</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* {location_link &&
                            <TouchableOpacity onPress={() => Linking.openURL(location_link)} style={{ paddingLeft: 10, paddingVertical: 10, }}>
                                <Image source={require('../../assets/map.png')} style={{ height: 20, width: 20 }} />
                            </TouchableOpacity>} */}
                        {orderstatus != 'Delivered' &&
                            <TouchableOpacity
                                style={{ justifyContent: 'center', paddingVertical: 10, paddingRight: 10, paddingLeft: 5 }}
                                onPress={(e) => {
                                    const { pageX, pageY } = e.nativeEvent;
                                    openModal(pageX, pageY);
                                }}
                            >
                                <Image source={require('../../assets/threedot.png')} style={{ height: 20, width: 20, tintColor: '#fff' }} />
                            </TouchableOpacity>}
                    </View>
                </View>
            </View>

            <View style={{ flex: 1, zIndex: 10 }}>
                <ScrollView
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ backgroundColor: '#e6f0ff', paddingVertical: 10, borderRadius: 5, marginBottom: 10, marginHorizontal: 2 }}>
                        <View style={{ paddingHorizontal: 5 }}>
                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                Name:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                    {` ${companyname}${area ? ` (${area})` : ''}`}
                                </Text>
                            </Text>
                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                Purchase Date:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                    {` ${formatOrderDate(orderdate)}`}
                                </Text>
                            </Text>
                        </View>

                        <View style={{ paddingHorizontal: 5 }}>

                            <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                Purchase Remark:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                    {` ${remark}`}
                                </Text>
                            </Text>
                            <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Medium', marginBottom: 5 }}>
                                Purchase No:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                    {` ${order_no}`}
                                </Text>
                            </Text>
                        </View>

                        <View style={{ paddingHorizontal: 5 }}>
                            {/* <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                    Paid:
                                    <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                        {` ${paid}`}
                                    </Text>
                                </Text>
                                <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                    Due:
                                    <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                        {` ${due}`}
                                    </Text>
                                </Text>
                            </View> */}
                            {/* <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                Total:
                                <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                    {` ${totalamt}`}
                                </Text>
                            </Text> */}

                            {/* {totaldueamt ? (
                                <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                    Total Due Payment:
                                    <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                        {` ${totaldueamt}`}
                                    </Text>
                                </Text>
                            ) : null} */}

                            {/* {creadibalance ? ( */}
                            {/* <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                    Credit Balance:
                                    <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                        {` ${creadibalance}`}
                                    </Text>
                                </Text>
                                {(usertype == 'Transporter' || usertype == 'Admin') && (orderstatus == 'On The Way' || orderstatus == 'Delivered') && creadibalance ? (
                                    <TouchableOpacity onPress={() => { setCreditModal(true); }}>
                                        <Text style={{ color: '#173161', fontSize: 12, fontFamily: 'Inter-Bold', textTransform: 'capitalize' }}>Redeem</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View> */}

                            {/* {transport_amt ? (
                                <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                    Transport Amount:
                                    <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                        {` ${transport_amt}`}
                                    </Text>
                                </Text>
                            ) : null}

                            {transport_remark ? (
                                <Text style={{ color: '#000', fontSize: 12, marginBottom: 5, fontFamily: 'Inter-Medium' }}>
                                   Transport Remark:
                                    <Text style={{ color: '#000', fontSize: 12, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                        {` ${transport_remark}`}
                                    </Text>
                                </Text>
                            ) : null} */}
                        </View>
                    </View>

                    <ScrollView
                        //  horizontal={showMargin?.["Show Margin"] == true} 
                        keyboardShouldPersistTaps='handled'>
                        {/* <View style={{ flex: 1 }}>
                            {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && permissions['Show Margin'] && (
                                <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                                    <View style={{ width: 40, justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>#</Text>
                                    </View>

                                    <View style={{ width: 120, justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>PRODUCT</Text>
                                    </View>

                                    <View style={{ width: 70, justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, flexDirection: 'row' }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}> QTY </Text>
                                    </View>

                                    <View style={{ width: 80, justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase' }}> RATE </Text>
                                    </View>

                                    <View style={{ width: 80, justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}> TOTAL </Text>
                                    </View>

                                    <View style={{ width: 95, justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', paddingHorizontal: 1, textTransform: 'uppercase' }}>Margin/Box</Text>
                                    </View>

                                    <View style={{ width: 80, justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', paddingHorizontal: 1, textTransform: 'uppercase' }}>Margin</Text>
                                    </View>

                                    <View style={{ width: 110, justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', paddingHorizontal: 1, textTransform: 'uppercase' }}>Margin after GSt/Box</Text>
                                    </View>

                                    <View style={{ width: 110, justifyContent: 'center', alignItems: 'center', borderColor: 'black' }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', paddingHorizontal: 1, textTransform: 'uppercase' }}>Margin after GSt</Text>
                                    </View>
                                </View>
                            )}

                            {!permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                                <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>#</Text>
                                    </View>

                                    <View style={{ width: '55%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>PRODUCT</Text>
                                    </View>

                                    <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}> QTY </Text>
                                    </View>

                                </View>
                            )}

                            {!permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                                <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>#</Text>
                                    </View>

                                    <View style={{ width: '45%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>PRODUCT</Text>
                                    </View>

                                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, flexDirection: 'row' }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}> QTY </Text>
                                    </View>

                                    <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}> TOTAL </Text>
                                    </View>
                                </View>
                            )}

                            {permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                                <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.5, borderColor: 'black', }}>
                                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderColor: 'black', }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>#</Text>
                                    </View>

                                    <View style={{ width: '45%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, }}>PRODUCT</Text>
                                    </View>

                                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, flexDirection: 'row' }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3 }}> QTY </Text>
                                    </View>

                                    <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', borderRightWidth: 0.5, }}>
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase' }}> RATE </Text>
                                    </View>

                                </View>
                            )}


                            {orderdetails && orderdetails.length > 0 ? (
                                orderdetails.map((item, index) => (
                                    <View key={index} >
                                        {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                                            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                <View style={{ width: 40, justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {index + 1}
                                                    </Text>
                                                </View>

                                                <View style={{ width: 120, justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.3, }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, textTransform: 'capitalize', }} >
                                                        {item.item_name}
                                                    </Text>
                                                </View>

                                                <View style={{ width: 70, flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.3, alignItems: 'center', borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {item.item_qty}
                                                    </Text>
                                                </View>

                                                <View style={{ width: 80, justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {item.item_price}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {Math.round(item.total_price)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {!permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                                            <View key={index} style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {index + 1}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '55%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.3, }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, textTransform: 'capitalize', }} >
                                                        {item.item_name}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '25%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {item.item_qty}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {!permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                                            <View key={index} style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {index + 1}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '45%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.3, }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, textTransform: 'capitalize', }} >
                                                        {item.item_name}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '20%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.3, alignItems: 'center', borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {item.item_qty}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {Math.round(item.total_price)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                                            <View key={index} style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {index + 1}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '45%', justifyContent: 'center', alignItems: 'flex-start', borderColor: 'black', borderRightWidth: 0.3, }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, textTransform: 'capitalize', }} >
                                                        {item.item_name}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '15%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.3, alignItems: 'center', borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {item.item_qty}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {item.item_price}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                    </View>

                                ))
                            ) : null}

                            {orderdetails && orderdetails.length > 0 && (
                                <View style={{ marginBottom: 10 }}>
                                    {permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                                        <View>
                                            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                <View style={{ width: '45%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        Total
                                                    </Text>
                                                </View>

                                                <View style={{ width: '15%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.3, alignItems: 'center', borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {calculateTotalQty()}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >

                                                    </Text>
                                                </View>

                                                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {calculateGrandTotal()}
                                                    </Text>
                                                </View>
                                            </View>

                                            {redeemamt &&
                                                <>
                                                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                        <View style={{ width: '45%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                                Redeem Amount
                                                            </Text>
                                                        </View>

                                                        <View style={{ width: '35%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >

                                                            </Text>
                                                        </View>

                                                        <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                                {redeemamt}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                        <View style={{ width: '45%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                                Total Amount
                                                            </Text>
                                                        </View>

                                                        <View style={{ width: '35%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >

                                                            </Text>
                                                        </View>

                                                        <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                                {totalpaybleamount}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </>
                                            }
                                        </View>
                                    )}

                                    {!permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                                        <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                            <View style={{ width: '70%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                    Total
                                                </Text>
                                            </View>

                                            <View style={{ width: '25%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }} >
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                    {calculateTotalQty()}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {!permissions["Order Price"]?.["Show Rate"] && permissions["Order Price"]?.["Show Total"] && (
                                        <View>
                                            <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                <View style={{ width: '60%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        Total
                                                    </Text>
                                                </View>

                                                <View style={{ width: '20%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.3, alignItems: 'center', borderColor: 'black', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                        {calculateTotalQty()}
                                                    </Text>
                                                </View>

                                                <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', }} >
                                                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                        {calculateGrandTotal()}
                                                    </Text>
                                                </View>
                                            </View>

                                            {redeemamt &&
                                                <>
                                                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                        <View style={{ width: '80%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                                Redeem Amount
                                                            </Text>
                                                        </View>

                                                        <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                                {redeemamt}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                                        <View style={{ width: '80%', justifyContent: 'center', alignItems: 'center', borderColor: 'black', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                                Total Amount
                                                            </Text>
                                                        </View>

                                                        <View style={{ width: '20%', justifyContent: 'center', alignItems: 'center', }} >
                                                            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                                {totalpaybleamount}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </>
                                            }
                                        </View>
                                    )}

                                    {permissions["Order Price"]?.["Show Rate"] && !permissions["Order Price"]?.["Show Total"] && (
                                        <View style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                            <View style={{ width: '60%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                    Total
                                                </Text>
                                            </View>

                                            <View style={{ width: '15%', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 0.3, alignItems: 'center', borderColor: 'black', }} >
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, }} >
                                                    {calculateTotalQty()}
                                                </Text>
                                            </View>

                                            <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.3, borderColor: 'black', }} >
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', padding: 3, fontSize: 12, }} >
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>

                            )}
                        </View> */}

                        <View style={{ flex: 1, width: '100%' }}>
                            {/* == HEADER == */}
                            <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'black', }} >
                                {columns.map((col, index) => (
                                    <View key={col.key} style={{ width: col.width, justifyContent: 'center', alignItems: 'center', borderRightWidth: index < columns.length - 1 ? 0.5 : 0, borderColor: 'black', }} >
                                        <Text style={{ color: 'black', fontFamily: 'Inter-Medium', padding: 3, textTransform: 'uppercase', textAlign: 'center', }} >{col.label}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* == BODY == */}
                            {orderdetails?.length > 0 &&
                                orderdetails.map((item, index) => (
                                    <View key={index} style={{ flexDirection: 'row', backgroundColor: 'white', borderWidth: 0.3, borderColor: 'black', }} >
                                        {columns.map((col, i) => (
                                            <View key={col.key} style={{ width: col.width, justifyContent: 'center', alignItems: 'center', borderRightWidth: i < columns.length - 1 ? 0.3 : 0, borderColor: 'black', }} >
                                                <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12, textAlign: col.key == 'product' ? 'left' : 'center', padding: 3, }} >
                                                    {col.key == 'sr' && index + 1}
                                                    {col.key == 'product' && item.item_name}
                                                    {col.key == 'qty' && item.item_qty}
                                                    {col.key == 'rate' && item.item_price}
                                                    {col.key == 'total' && Math.round(item.total_price)}
                                                    {/* Margin related columns ko remove karein */}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}

                            {/* == FOOTER (TOTALS) == */}
                            {orderdetails?.length > 0 && (
                                <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: 'black' }} >
                                    {columns.map((col, index) => {
                                        if (col.key == 'product') return null;
                                        const mergedWidth =
                                            col.key == 'sr' ? columns[0].width + columns[1].width : col.width;

                                        let value = '';
                                        if (col.key == 'sr') value = 'Total';
                                        if (col.key == 'qty') value = calculateTotalQty();
                                        if (col.key == 'total') value = calculateGrandTotal();
                                        {/* Margin totals ko remove karein */ }

                                        return (
                                            <View key={col.key} style={{ width: mergedWidth, justifyContent: 'center', alignItems: 'center', borderRightWidth: index < columns.length - 1 ? 0.3 : 0, borderColor: 'black', paddingVertical: 3, borderBottomWidth: 1 }} >
                                                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 12, color: 'black', textAlign: 'center', padding: 3, }} >
                                                    {value}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {/* == REDEEM + TOTAL AMOUNT == */}
                            {redeemamt && (
                                <>
                                    {/* Redeem Amount */}
                                    <View style={{ flexDirection: 'row', borderWidth: 0.3, borderColor: 'black' }}>
                                        {columns.map((col, idx) => {
                                            if (col.key == 'product') return null;

                                            const mergedWidth =
                                                col.key == 'sr' ? columns[0].width + columns[1].width : col.width;

                                            let value = '';
                                            if (col.key == 'sr') value = 'Redeem Amount';
                                            if (col.key == 'total') value = redeemamt;

                                            return (
                                                <View key={col.key} style={{ width: mergedWidth, justifyContent: 'center', alignItems: 'center', borderColor: 'black', paddingVertical: 3, }} >
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'black', textAlign: 'center', padding: 3, }} >{value}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    {/* Total Amount */}
                                    <View style={{ flexDirection: 'row', borderWidth: 0.3, borderColor: 'black' }}>
                                        {columns.map((col, idx) => {
                                            if (col.key == 'product') return null;

                                            const mergedWidth =
                                                col.key == 'sr' ? columns[0].width + columns[1].width : col.width;

                                            let value = '';
                                            if (col.key == 'sr') value = 'Total Amount';
                                            if (col.key == 'total') value = totalpaybleamount;

                                            return (
                                                <View key={col.key} style={{ width: mergedWidth, justifyContent: 'center', alignItems: 'center', borderColor: 'black', paddingVertical: 3, }} >
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'black', textAlign: 'center', padding: 3, }} >{value}</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </>
                            )}

                        </View>
                    </ScrollView>

                    {transport_amt ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', paddingHorizontal: 10 }}>
                            <View style={{ width: '70%', borderRightWidth: 0.5, borderColor: '#ccc', }}>
                                <Text style={{ color: '#000', fontSize: 14, paddingTop: 5, fontFamily: 'Inter-Bold', textAlign: 'left' }}>
                                    Transport Charge:
                                    <Text style={{ color: '#000', fontSize: 14, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}>
                                        {` ${transport_amt}`}
                                    </Text>
                                </Text>
                                <Text style={{ color: '#000', fontSize: 14, paddingBottom: 5, fontFamily: 'Inter-Bold', textTransform: 'capitalize' }}>Payment Method:
                                    <Text style={{ color: '#000', fontSize: 14, fontFamily: 'Inter-Regular', textTransform: 'capitalize' }}> {transportpaymode}</Text>
                                </Text>
                            </View>
                            <Text style={{ color: '#000', fontSize: 14, marginBottom: 5, fontFamily: 'Inter-Bold', textAlign: 'right' }}>{trasportpaystatus}</Text>
                            {trasportpaystatus == 'Unpaid' &&
                                <TouchableOpacity onPress={() => setTransportmodal(true)}>
                                    <Image source={require('../../assets/cash-payment.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                </TouchableOpacity>}
                        </View>
                    ) : null}

                    {(usertype == 'Transporter' || usertype == 'Admin') && (due != 0 || isupdatemode) && (orderstatus == 'On The Way' || orderstatus == 'Delivered') &&
                        <View style={{ backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 10, marginVertical: 5, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }}>
                            <View style={{ marginBottom: 10, marginTop: 10, zIndex: paymentmethodopen ? 20 : 10 }}>
                                <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Payment Method</Text>
                                <DropDownPicker
                                    placeholder='Select Payment'
                                    open={paymentmethodopen}
                                    value={paymentmethodvalue}
                                    items={paymentmethoditems}
                                    setOpen={(isOpen) => {
                                        setPaymentMethodOpen(isOpen);
                                        if (isOpen) {
                                            Keyboard.dismiss();
                                            setStatusOpen(false);
                                        }
                                    }}
                                    setValue={setPaymentMethodValue}
                                    onChangeValue={(value) => {
                                        if (value == 'UPI') {
                                            setUpiModalVisible(true);
                                        }
                                    }}

                                    setItems={setPaymentMethodItems}
                                    style={{
                                        width: '92%',
                                        height: 40,
                                        borderRadius: 10,
                                        borderColor: errors.method ? 'red' : 'gray',
                                        backgroundColor: '#fff',
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
                                        borderColor: '#fff',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 3,
                                        elevation: 2,
                                        backgroundColor: '#fff',
                                        maxHeight: 600
                                    }}
                                    dropDownDirection='BOTTOM'
                                />
                            </View>
                            {errors.method ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.method}</Text> : null}
                            {selectedupiid &&
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ color: '#000', fontFamily: 'Inter-Regular', fontSize: 12, marginLeft: 18, }}>{selectedupiid}</Text>
                                    <Text onPress={() => setUpiModalVisible(true)} style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12, }}>  Want to change ?</Text>
                                </View>
                            }

                            {(!isupdatemode || (isupdatemode && usertype == 'Admin')) && (

                                <View style={{ marginTop: 10, marginHorizontal: 13, opacity: paymentmethodvalue == 'Baki' ? 0.5 : 1 }}>
                                    <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 5, }}>Payment Amount</Text>
                                    <TextInput editable={paymentmethodvalue != 'Baki'} keyboardType='numeric' value={paidamt} onChangeText={setPaidamt} onFocus={() => { setStatusOpen(false); setPaymentMethodOpen(false) }} style={{ width: '100%', fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: paymentmethodvalue == 'Baki' ? 'gray' : '#000', borderWidth: 1, borderColor: errors.paidamt ? 'red' : 'gray', borderRadius: 11 }} />
                                    {errors.paidamt ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{errors.paidamt}</Text> : null}
                                </View>
                            )}
                            {!isupdatemode &&
                                <>
                                    <View style={{ marginBottom: 10, marginTop: 10, zIndex: statusopen ? 20 : 10 }}>
                                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 18, }}>Order Status</Text>
                                        <DropDownPicker
                                            open={statusopen}
                                            value={statusvalue}
                                            items={statusitems}
                                            setOpen={(isOpen) => {
                                                setStatusOpen(isOpen);
                                                if (isOpen) {
                                                    Keyboard.dismiss();
                                                    setPaymentMethodOpen(false);
                                                }
                                            }}
                                            setValue={setStatusValue}
                                            setItems={setStatusItems}
                                            style={{
                                                width: '92%',
                                                height: 40,
                                                borderRadius: 10,
                                                borderColor: errors.status ? 'red' : 'gray',
                                                backgroundColor: '#fff',
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
                                                borderColor: '#fff',
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowOpacity: 0.1,
                                                shadowRadius: 3,
                                                elevation: 2,
                                                backgroundColor: '#fff',
                                                maxHeight: 600
                                            }}
                                            dropDownDirection='BOTTOM'
                                        />
                                    </View>
                                    {errors.status ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 15 }}>{errors.status}</Text> : null}
                                </>
                            }

                            <View style={{ alignItems: 'center', marginTop: 10 }}>
                                <TouchableOpacity disabled={!paidamt || !paymentmethodvalue || !statusvalue} onPress={isupdatemode ? updatepayment : addpayment} style={{ backgroundColor: !paidamt || !paymentmethodvalue || !statusvalue ? '#C5C6D0' : '#007bff', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 10, width: '90%', alignItems: 'center' }} >
                                    <Text style={{ color: !paidamt || !paymentmethodvalue || !statusvalue ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }

                    {usertype !== 'Salesman' && (
                        <>
                            {paymentlist && paymentlist.length > 0 ? (
                                paymentlist.map((item, index) => (
                                    <View key={index} style={{ zIndex: -10, backgroundColor: '#F8F8F8', borderRadius: 10, marginHorizontal: 10, marginVertical: 5, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, paddingHorizontal: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', fontSize: 12 }}>Paid Amount:
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}> {item.paid_amount}</Text>
                                            </Text>

                                            {permissions["Payment Entry"] && (
                                                <TouchableOpacity
                                                    style={{ justifyContent: 'center', }}
                                                    onPress={(e) => {
                                                        const { pageX, pageY } = e.nativeEvent;
                                                        openpaymentModal(item, pageX, pageY);
                                                    }}
                                                >
                                                    <Image source={require('../../assets/threedot.png')} style={{ height: 15, width: 15, tintColor: '#000' }} />
                                                </TouchableOpacity>)}
                                        </View>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', fontSize: 12 }}>Due Amount:
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}> {item.deu_amount ? item.deu_amount : '0'}</Text>
                                        </Text>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', fontSize: 12 }}>Payment Method:
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}> {item.payment_mode}</Text>
                                        </Text>

                                        <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', fontSize: 12 }}>Entry Date:
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}> {item.payment_date
                                                ? new Date(item.payment_date).toLocaleDateString("en-GB")
                                                : ""}</Text>
                                        </Text>
                                    </View>
                                ))) : null}
                        </>
                    )}

                    {duepaymentlist.length > 0 && <View style={{ borderWidth: 0.5, borderColor: '#D3D3D3', margin: 10 }}></View>}
                    {duepaymentlist && duepaymentlist.length > 0 && (
                        <>
                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', fontSize: 14, marginLeft: 10, }}>Old Due Payments</Text>
                            {duepaymentlist.map((item, index) => {
                                if (!animations[index]) {
                                    animations[index] = new Animated.Value(0);
                                }

                                const heightInterpolation = animations[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 250],
                                });

                                return (
                                    <View key={index} style={{ zIndex: -10, backgroundColor: '#F8F8F8', borderRadius: 10, marginHorizontal: 10, marginVertical: 5, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, paddingHorizontal: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 0 }}>
                                            <TouchableOpacity onPress={() => navigation.push('OrderDetails', { order_no: item.order_no, orderdate: item.order_date, customername: item.full_name, Remark: item.remark, companyname: item.company_name, location_link: item.location_link, orderstatus: item.status, area: item.area, formatteddate, valuestatus })}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', fontSize: 12 }}>Order No:
                                                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}> {item.order_no}</Text>
                                                </Text>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', fontSize: 12 }}>Due Amount:
                                                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}> {item.total_price}</Text>
                                                </Text>

                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', fontSize: 12 }}>Created On:
                                                    <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }}>
                                                        {item.order_date
                                                            ? new Date(item.order_date).toLocaleDateString("en-GB") + ' ' +
                                                            new Date(item.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                            : ""}</Text>
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => handleToggleExpand(index)} style={{ justifyContent: 'center', paddingHorizontal: 10 }}>
                                                <Image source={expandedIndex == index ? require('../../assets/up-arrow.png') : require('../../assets/down-arrow.png')} style={{ height: 20, width: 20, tintColor: '#000' }} />
                                            </TouchableOpacity>
                                        </View>

                                        <Animated.View style={{ height: expandedIndex == index ? heightInterpolation : 0, overflow: 'hidden' }}>
                                            {expandedIndex == index &&
                                                <>
                                                    <View style={{ marginBottom: 10, marginTop: 10, zIndex: paymentmethodopen ? 20 : 10 }}>
                                                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 10, }}>Payment Method</Text>
                                                        <DropDownPicker
                                                            placeholder='Select Payment Mode'
                                                            open={paydueamtmethodopen[item.order_no] || false}
                                                            value={paydueamtmethodvalue[item.order_no] || null}
                                                            items={paydueamtmethoditems}
                                                            setOpen={(isOpen) => {
                                                                setPaydueamtMethodOpen(prev => ({ ...prev, [item.order_no]: isOpen }));
                                                                if (isOpen) {
                                                                    Keyboard.dismiss();
                                                                    setStatusOpen(false);
                                                                    setPaymentMethodOpen(false);
                                                                }
                                                            }}
                                                            setValue={(callback) =>
                                                                setPaydueamtMethodValue((prev) => {
                                                                    const updatedValue = typeof callback == 'function'
                                                                        ? callback(prev?.[item.order_no] || null)
                                                                        : callback;

                                                                    return { ...prev, [item.order_no]: updatedValue };
                                                                })
                                                            }
                                                            // onChangeValue={(value) => {
                                                            //     if (value == 'UPI') {
                                                            //         setUpiModalVisible(true);
                                                            //     }
                                                            // }}
                                                            setItems={setPaydueamtMethodItems}
                                                            style={{
                                                                width: '95%',
                                                                height: 40,
                                                                borderRadius: 10,
                                                                borderColor: oldpayerrors[item.order_no]?.method ? 'red' : 'gray',
                                                                backgroundColor: '#fff',
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
                                                                borderColor: '#fff',
                                                                shadowColor: '#000',
                                                                shadowOffset: { width: 0, height: 1 },
                                                                shadowOpacity: 0.1,
                                                                shadowRadius: 3,
                                                                elevation: 2,
                                                                backgroundColor: '#fff',
                                                                maxHeight: 600
                                                            }}
                                                            dropDownDirection='BOTTOM'
                                                        />
                                                        {oldpayerrors[item.order_no]?.method ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 10, marginLeft: 10 }}>{oldpayerrors[item.order_no]?.method}</Text> : null}
                                                    </View>

                                                    <View style={{ marginTop: 10, marginHorizontal: 0, opacity: paydueamtmethodvalue == 'Baki' ? 0.5 : 1 }}>
                                                        <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 10, }}>Payment Amount</Text>
                                                        <TextInput keyboardType='numeric' value={paydueamt[item.order_no || '']} onChangeText={(text) => setPaydueamt({ ...paydueamt, [item.order_no]: text })} onFocus={() => { setPaydueamtMethodOpen(false) }} style={{ width: '95%', alignSelf: 'center', fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: oldpayerrors[item.order_no]?.paydueamt ? 'red' : 'gray', borderRadius: 11 }} />
                                                        {oldpayerrors[item.order_no]?.paydueamt ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 10 }}>{oldpayerrors[item.order_no]?.paydueamt}</Text> : null}
                                                    </View>

                                                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                                                        <TouchableOpacity disabled={!paydueamt || !paydueamtmethodvalue} onPress={() => addoldpayment(item.order_no, item.total_price)} style={{ backgroundColor: !paydueamt || !paydueamtmethodvalue ? '#C5C6D0' : '#007bff', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 0, width: '95%', alignItems: 'center' }} >
                                                            <Text style={{ color: !paydueamt || !paydueamtmethodvalue ? '#000' : '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Save</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </>}
                                        </Animated.View>
                                    </View>
                                );
                            })}
                        </>
                    )}
                </ScrollView>
            </View>


            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                            <Text style={{ width: 70, fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        {/* )} */}
                        {(orderstatus == 'Pending') && (
                            <TouchableOpacity disabled={orderstatus != 'Pending'} onPress={() => { confirmDelete(); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: orderstatus != 'Pending' ? 0.5 : 1 }}>
                                <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                                <Text style={{ width: 70, fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                            </TouchableOpacity>
                        )}
                        {/* {hasPermissions.Location && ( */}
                        {/* <TouchableOpacity onPress={() => { navigation.navigate('AddCustomer', { customerId: customerId, screen: 'orderdetail' }); setModalvisible(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ width: 70, fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Location</Text>
                        </TouchableOpacity> */}
                        {/* )} */}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={paymentmodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setPaymentModal(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    {/* <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '50%', gap: 10, backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}> */}
                    {/* <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>{selectedCategory.name}:</Text> */}
                    <View
                        onStartShouldSetResponder={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: paymentmodalposition.top,
                            left: paymentmodalposition.left,
                            gap: 10,
                            backgroundColor: '#fff',
                            paddingHorizontal: 20,
                            paddingBottom: 20,
                            paddingTop: 10,
                            borderRadius: 10,
                        }}
                    >
                        <TouchableOpacity onPress={handleEditpayment} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Edit</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => { confirmDelete(); setPaymentModal(false); }} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <Image source={require('../../assets/trash-bin.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} />
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Medium', color: '#173161' }}>Delete</Text>
                        </TouchableOpacity> */}
                    </View>
                </TouchableOpacity>
            </Modal>
            {/* 
            <Modal visible={transportmodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setPaydueamtMethodOpen(false); setTransportpayValue(''); setTransportmodal(false); setTransportpayOpen(false); setError(null); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 20, paddingTop: 20, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginHorizontal: 10 }}>
                            <Text style={{ color: '#fff' }}>*</Text>
                            <TouchableOpacity onPress={() => { setPaydueamtMethodOpen(false); setTransportpayValue(''); setTransportmodal(false); setTransportpayOpen(false); setError(null); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 0, }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Payment Mode
                                <Text style={{ color: '#e60000' }}>*</Text>
                            </Text>
                            <DropDownPicker
                                placeholder="Select Payment Mode"
                                open={transportpayopen}
                                value={transportpayvalue}
                                items={transportpayitems}
                                setOpen={(isOpen) => {
                                    setTransportpayOpen(isOpen);
                                    if (isOpen) {
                                        Keyboard.dismiss();
                                        setPaydueamtMethodOpen(false);
                                    }
                                }}
                                setValue={setTransportpayValue}
                                setItems={setTransportpayItems}
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
                            {errors ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 10, marginLeft: 10 }}>{error}</Text> : null}
                        </View>
                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: 'gray', paddingHorizontal: 10 }}>Transport Charge</Text>
                        <Text style={{ color: '#000', fontFamily: 'Inter-SemiBold', fontSize: 14, borderWidth: 1, opacity: 0.5, borderColor: 'gray', borderRadius: 10, padding: 10, paddingVertical: 15, marginHorizontal: 5, marginBottom: 10 }}>{transport_amt}</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color="#173161" />
                        ) : (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={paytransportcharge} style={{ width: 120, backgroundColor: '#173161', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Save
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => { setPaydueamtMethodOpen(false); setTransportpayValue(''); setTransportmodal(false); setTransportpayOpen(false); setError(null); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                    <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal> */}

            {/* upi id modal */}
            {/* <Modal
                visible={upiModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setUpiModalVisible(false)}
            >
                <TouchableOpacity onPress={() => { setUpiModalVisible(false); setSelectedUpiId(null); setUpilink(null); }} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, paddingBottom: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#000' }}>Select UPI ID</Text>
                            <TouchableOpacity onPress={() => { setUpiModalVisible(false); setSelectedUpiId(null); setUpilink(null); }} >
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ marginBottom: 5, marginHorizontal: 13, opacity: paymentmethodvalue == 'Baki' ? 0.5 : 1 }}>
                            <Text style={{ color: 'gray', fontFamily: 'Inter-Regular', fontSize: 12, marginHorizontal: 5, }}>Amount</Text>
                            <TextInput keyboardType='numeric' value={amount} onChangeText={setAmount} style={{ width: '100%', fontFamily: 'Inter-Medium', fontSize: 14, paddingHorizontal: 10, color: '#000', borderWidth: 1, borderColor: QRErrors.paidamt ? 'red' : 'gray', borderRadius: 11 }} />
                            {QRErrors?.paidamt ? <Text style={{ color: 'red', fontSize: 12, fontFamily: 'Inter-Regular' }}>{QRErrors.paidamt}</Text> : null}
                        </View>

                        <View style={{ borderBottomWidth: 1, borderColor: '#ccc' }}></View>
                        <RadioButton.Group onValueChange={value => { setSelectedUpiId(value); setUpiModalVisible(false); }} value={selectedupiid}>
                            <FlatList
                                data={upilist}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => { setSelectedUpiId(item.upi_id); setUpilink(item.upi_link); setUpiModalVisible(false); }}
                                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 3, borderBottomWidth: 1, borderColor: '#ccc', margin: 5, paddingBottom: 5 }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <RadioButton color="#173161" value={item.upi_id} />
                                            <View style={{ width: '75%' }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>UPI ID: </Text>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161' }}>{item.upi_id}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>UPI Limit: </Text>
                                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: '#173161' }}>{item.upi_limit}</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity onPress={() => {
                                                if (parseFloat(amount) <= 0) {
                                                    setQRErrors(prev => ({ ...prev, paidamt: 'Please enter amount greater than 0' }));
                                                    return;
                                                }

                                                if (parseFloat(amount) > parseFloat(totalamt)) {
                                                    setQRErrors(prev => ({ ...prev, paidamt: 'Amount should less than total amount of the order' }));
                                                    return;
                                                }

                                                if (parseFloat(amount) > parseFloat(item.upi_limit)) {
                                                    setQRErrors(prev => ({ ...prev, paidamt: 'Amount exceeds UPI limit' }));
                                                    return;
                                                }

                                                setErrors(prev => ({ ...prev, paidamt: null })); // Clear previous errors
                                                setPaidamt(amount); // Set the validated amount
                                                setSelectedUpiImage(item.image);
                                                setSelectedUpiId(item.upi_id);
                                                setUpilink(item.upi_link);
                                                setShowQRCode(true);
                                                setUpiModalVisible(false);
                                            }}>
                                                <MaterialCommunityIcons name="qrcode" size={30} color="#173161" />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </RadioButton.Group>
                    </View>
                </TouchableOpacity>
            </Modal> */}

            {
                showQRCode && (
                    <Modal
                        visible={showQRCode}
                        transparent
                        animationType="fade"
                        onRequestClose={() => { setShowQRCode(false); setSelectedUpiImage(null); }}
                    >
                        <TouchableOpacity
                            onPress={() => { setShowQRCode(false); setSelectedUpiImage(null); }}
                            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <View style={{ backgroundColor: 'white', paddingBottom: 10, borderRadius: 10 }}>
                                <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 0, paddingVertical: 10, alignItems: 'center' }}>
                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: '#000' }}></Text>
                                    <TouchableOpacity onPress={() => { setShowQRCode(false); }} >
                                        <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#000', marginBottom: 5, paddingHorizontal: 10 }}>Scan this code to pay {amount ? `₹${amount}` : ''} instantly</Text>
                                <View style={{ borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 10 }}></View>
                                <View style={{ alignItems: "center", paddingHorizontal: 10 }}>
                                    {amount ?
                                        <QRCode
                                            value={`upi://pay?pa=${selectedupiid}&pn=${encodeURIComponent(upilink)}&am=${amount}&cu=INR`}
                                            size={170}
                                        />
                                        : <QRCode
                                            value={`upi://pay?pa=${selectedupiid}&pn=${encodeURIComponent(upilink)}&cu=INR`}
                                            size={170}
                                        />}

                                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#000' }}>{selectedupiid}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                )
            }

            {/* Credit Balance Redeem */}
            <Modal visible={creditmodal} transparent animationType="slide">
                <TouchableOpacity onPress={() => { setCreditModal(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', padding: 20, backgroundColor: 'white', borderRadius: 10, }} >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#000' }}>Redeem Balance</Text>
                            <TouchableOpacity onPress={() => { setCreditModal(false); setRedeemamt(''); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={{ fontSize: 14, marginLeft: 5, marginBottom: 0, fontFamily: 'Inter-Regular', color: 'gray' }}>
                            Enter Redeem Amount:
                        </Text>
                        <TextInput keyboardType='numeric' style={{ width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, marginBottom: 10, color: '#000', fontFamily: 'Inter-Regular' }} value={redeemamt} onChangeText={setRedeemamt} />

                        {redeemError !== '' && (
                            <Text style={{ color: 'red', marginBottom: 10, fontSize: 12, fontFamily: 'Inter-Regular', marginLeft: 10 }}>
                                {redeemError}
                            </Text>
                        )}

                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => {
                                const redeemAmount = parseFloat(redeemamt);
                                const availableBalance = parseFloat(creadibalance);
                                const total = parseFloat(totalamt);
                                if (!redeemAmount) {
                                    setRedeemError('Redeem amount is required');
                                    return;
                                }

                                if (redeemAmount <= 0) {
                                    setRedeemError('Redeem amount must be greater than 0');
                                    return;
                                }

                                if (redeemAmount > availableBalance) {
                                    setRedeemError('Redeem amount exceeds available balance');
                                    return;
                                }

                                // All good – clear error and proceed
                                setRedeemError('');
                                setCreditModal(false);
                                setTotalpaybleamount(total - redeemAmount);
                                // setRedeemamt('');
                            }} style={{ backgroundColor: '#007bff', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, width: '40%', alignItems: 'center' }} >
                                {/* {mainloading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : ( */}
                                <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-SemiBold' }}>Redeem</Text>
                                {/* )} */}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View >
    )
}

export default PurchaseDetails