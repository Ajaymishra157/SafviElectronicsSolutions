import { View, Text, Image, Alert, StatusBar, ActivityIndicator, TouchableOpacity, ScrollView, AppState, BackHandler } from 'react-native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import Constant from './Commoncomponent/Constant';
import MyButton from './Commoncomponent/MyButton';
import { Modal } from 'react-native-paper';
import RNExitApp from 'react-native-exit-app';

const images = {
    users: require('../assets/users.png'),
    category: require('../assets/category.png'),
    products: require('../assets/icons8-terms-and-conditions-90.png'),
    customers: require('../assets/user.png'),
    orders: require('../assets/trolley.png'),
    sales: require('../assets/information.png'),
    deliveryman: require('../assets/delivery-boy.png'),
    payment: require('../assets/icons8-100-96.png'),
    customer: require('../assets/letter-a.png'),
    bag: require('../assets/bag.png'),
    ledger: require('../assets/ledger.png'),
    product: require('../assets/product.png'),
    stock: require('../assets/asset.png'),
    purchase: require('../assets/purchase.png'),
    sell: require('../assets/sell.png'),
    target: require('../assets/target.png'),
    upi: require('../assets/upi.png'),
    scheme: require('../assets/discount.png'),
    calculator: require('../assets/calculator.png'),
    staff: require('../assets/staffs.png'),
    festive: require('../assets/festival.png'),
    attendance: require('../assets/checking-attendance.png'),
    service: require('../assets/service.png')
};

const Dashboard = ({ navigation }) => {
    const [userName, setUserName] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apkversion, setApkVersion] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [stockdata, setStockdata] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [Bdmtarget, setBdmtarget] = useState();
    const [duebills, setDuebills] = useState([]);
    const [modalStep, setModalStep] = useState("product"); // "product" | "duebills"
    const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const [usertype, setUsertype] = useState(null);


    const [CloseAppModal, setCloseAppModal] = useState(false);


    const app_version = "26.0";

    useEffect(() => {
        const resetModalState = async () => {
            await AsyncStorage.setItem('modalShown', 'false');
        };
        resetModalState();
    }, []);

    const listPermissions = useCallback(async () => {
        try {
            setLoading(true);
            const id = await AsyncStorage.getItem('admin_id');
            const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: id }),
            });

            const result = await response.json();
            if (result.code == "200") {
                setApkVersion(result.apk_version);
                if (result.status == "deactive") {
                    Alert.alert("Access Denied", "Your account has been deactivated.");
                    await AsyncStorage.clear(); // Clear stored user data
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "LoginUser" }]
                    }); // Redirect to login
                }
                const permissionsData = result.payload.reduce((acc, item) => {
                    acc[item.menu_name] = item.menu_permission.split(',').reduce((obj, perm) => {
                        obj[perm] = true;
                        return obj;
                    }, {});
                    return acc;
                }, {});

                setPermissions(permissionsData);
                const modalShown = await AsyncStorage.getItem('modalShown');

                if ((!modalShown || modalShown == 'false')) {
                    if (permissionsData["Pending Product Summary"]) {
                        // Start with product summary
                        setModalStep("product");
                        setIsModalVisible(true);
                        await AsyncStorage.setItem('modalShown', 'true');
                    } else if (duebills.length > 0) {
                        // Skip product summary → go directly to due bills
                        setModalStep("duebills");
                        setCurrentCompanyIndex(0);
                        setIsModalVisible(true);
                        await AsyncStorage.setItem('modalShown', 'true');
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            listPermissions();
        }, [listPermissions])
    );

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
    useFocusEffect(
        React.useCallback(() => {
            fetchusertype();

        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                console.log("called");
                setCloseAppModal(true); // Show modal on back press
                return true; // Prevent default behavior
            };

            BackHandler.addEventListener("hardwareBackPress", backAction);

            return () =>
                BackHandler.removeEventListener("hardwareBackPress", backAction);
        }, [])
    );

    const closeExitModal = () => {
        setCloseAppModal(false);

    }
    const confirmExit = () => {
        RNExitApp.exitApp();
    };

    const fetchbdmtarget = async () => {
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.salesman_progress}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                salesman_id: id,
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setBdmtarget(result.payload);
        } else {
            setBdmtarget([]);
            console.log('error while fetching data');
        }
        // setMainloading(false);
    };

    const fetchstockdata = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.stock_status}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({

            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setStockdata(result.payload);
        } else {
            setStockdata([]);
            console.log('error while fetching data');
        }
        // setMainloading(false);
    };

    const fetchduebills = async () => {
        const id = await AsyncStorage.getItem('admin_id');

        const url = `${Constant.URL}${Constant.OtherURL.credit_notification}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setDuebills(result.payload);
        } else {
            setDuebills([]);
            console.log('error while fetching data');
        }
        // setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchstockdata();
            fetchbdmtarget();
            fetchduebills();
        }, [])
    );

    // Calculate progress percentage
    const progress =
        Bdmtarget && Bdmtarget.bdm_target > 0
            ? Bdmtarget.achieve_bdm_target / Bdmtarget.bdm_target
            : 0;

    const progressPercent = (progress * 100).toFixed(2);

    useEffect(() => {
        const checkModalState = async () => {
            try {
                const modalShown = await AsyncStorage.getItem('modalShown');

                if (!modalShown || modalShown == 'false') {
                    if (permissions["Pending Product Summary"]) {
                        setModalStep("product");       // always start fresh
                        setCurrentCompanyIndex(0);
                        setIsModalVisible(true);
                    } else if (duebills.length > 0) {
                        setModalStep("duebills");      // start with duebills first company
                        setCurrentCompanyIndex(0);
                        setIsModalVisible(true);
                    }
                } else {
                    console.log("Modal was already shown, not displaying again");
                }
            } catch (error) {
                console.error("Error reading modal state:", error);
            }
        };

        checkModalState(); // Initial check on component mount

        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === "active") {
                checkModalState();
            }
        };

        const subscription = AppState.addEventListener("change", handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [permissions, duebills]);


    // Reset modal state when app moves to the background or crashes
    useEffect(() => {
        const handleAppClose = async (nextAppState) => {
            if (nextAppState == 'background' || nextAppState === 'inactive') {
                console.log('App is closing, resetting modalShown');
                await AsyncStorage.setItem('modalShown', 'false');
            }
        };

        const subscription = AppState.addEventListener('change', handleAppClose);

        return () => {
            console.log('Removing AppState listener (handleAppClose)');
            subscription.remove();
        };
    }, []);


    useEffect(() => {
        const fetchUserName = async () => {
            const name = await AsyncStorage.getItem('user_name');
            if (name) setUserName(name);
        };
        fetchUserName();
    }, []);

    // const logoutfunction = () => {
    //     Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
    //         { text: 'Cancel', style: 'cancel' },
    //         {
    //             text: 'Logout',
    //             onPress: async () => {
    //                 await AsyncStorage.clear();
    //                 navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'LoginUser' }] }));
    //             },
    //         },
    //     ]);
    // };
    const logoutfunction = () => {
        setLogoutModalVisible(true);
    };


    const confirmLogout = async () => {
        setLogoutModalVisible(false);
        await AsyncStorage.clear();
        navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'LoginUser' }] })
        );
    };

    const hasPermission = useMemo(
        () => (menu) => permissions.hasOwnProperty(menu),
        [permissions]
    );

    const hasOrderAddPermission = Object.entries(permissions).some(
        ([menuName, menuPermissions]) => menuName == "Orders" && menuPermissions["Add"]
    );
    const closeModal = () => {
        setIsModalVisible(false);
        setModalStep("product");        // reset to product
        setCurrentCompanyIndex(0);      // reset company index
    };

    const handleOkPress = () => {
        if (modalStep == "product") {
            // Switch to Due Bills after product summary
            if (duebills.length > 0) {
                setModalStep("duebills");
                setCurrentCompanyIndex(0);
            } else {
                setIsModalVisible(false); // No due bills → close
            }
        } else if (modalStep == "duebills") {
            if (currentCompanyIndex < duebills.length - 1) {
                setCurrentCompanyIndex(currentCompanyIndex + 1); // Next company
            } else {
                closeModal(); // No more companies → close
            }
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0a326e" />
            </View>
        );
    }







    return (
        <View style={{ flex: 1 }}>
            <StatusBar backgroundColor="#173161" barStyle="light-content" />
            {/* Header */}
            <View style={{ height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#173161', paddingHorizontal: 10 }}>
                <TouchableOpacity onPress={() => navigation.navigate('MyProfile')} style={{ padding: 10 }}>
                    <Image source={require('../assets/profile-user.png')} style={{ height: 20, width: 20, tintColor: '#fff' }} />
                </TouchableOpacity>
                <Text onLongPress={() => {
                    if (permissions["Pending Product Summary"]) {
                        setModalStep("product");        // reset to product summary
                        setCurrentCompanyIndex(0);
                        setIsModalVisible(true);
                    } else if (duebills.length > 0) {
                        setModalStep("duebills");       // start with duebills
                        setCurrentCompanyIndex(0);
                        setIsModalVisible(true);
                    }
                }} style={{ fontFamily: 'Inter-Bold', fontSize: 18, color: '#fff' }}>Safvi Electricals Solutions</Text>
                <TouchableOpacity onPress={logoutfunction} style={{ padding: 10 }}>
                    <Image source={require('../assets/log-out.png')} style={{ height: 20, width: 20, tintColor: '#fff' }} />
                </TouchableOpacity>
            </View>

            {
                apkversion == app_version && Bdmtarget && Bdmtarget.bdm_target > 0 && (
                    <>
                        <View style={{ justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 5 }}>
                            <Text style={{ color: '#173161', fontFamily: 'Inter-Regular', fontSize: 12 }} >My Target ({Bdmtarget.month})</Text>
                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12 }} >{Bdmtarget.achieve_bdm_target}
                                <Text style={{ fontFamily: 'Inter-Regular', color: '#173161', fontSize: 12, marginHorizontal: 10, textAlign: 'right' }}> out of</Text> {Bdmtarget.bdm_target}
                                <Text style={{ fontFamily: 'Inter-Regular', color: '#173161', fontSize: 12, marginHorizontal: 10, textAlign: 'right' }}> Box</Text></Text>
                        </View>

                        <View style={{ paddingHorizontal: 5 }}>
                            <View style={{ height: 20, width: '100%', backgroundColor: '#ccc', borderRadius: 5, overflow: 'hidden', position: 'relative', }} >
                                <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#0a326e', position: 'absolute', top: 0, left: 0, }} />
                            </View>
                        </View>
                        <Text style={{ fontFamily: 'Inter-SemiBold', color: '#173161', fontSize: 12, marginHorizontal: 10, textAlign: 'right' }}>{progressPercent}%
                            <Text style={{ fontFamily: 'Inter-Regular', color: '#173161', fontSize: 12, marginHorizontal: 10, textAlign: 'right' }}> Completed </Text></Text>
                    </>
                )
            }
            {/* Welcome Message */}
            <Text style={{ fontFamily: 'Inter-SemiBold', color: '#173161', fontSize: 14, margin: 10 }}>Welcome, {userName}: {app_version}(1.9)</Text>

            {/* {
                apkversion != app_version && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: '#173161', textAlign: 'center' }}>
                            Please Update Your APP.
                        </Text>
                    </View>
                )
            } */}



            <View style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}>
                <ScrollView keyboardShouldPersistTaps='handled' >
                    {/* Permissions-Based UI */}
                    {/* {hasPermission("Users") || hasPermission("Category") || hasPermission("Sub Category") ? ( */}
                    {usertype !== 'Staff' && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', backgroundColor: '#fff', elevation: 5 }}>
                            {/* {hasPermission("Users") && */}
                            <PermissionButton navigation={navigation} route="Categorylist" image="category" label="Category" />
                            <PermissionButton navigation={navigation} route="SubCategorylist" image="category" label="Sub Category" />
                            <PermissionButton navigation={navigation} route="Productlist" image="products" label="Products" />


                            {/* {hasPermission("Category") &&  */}


                            {/* {hasPermission("Sub Category") &&  */}

                        </View>
                    )}
                    {/* ) : null} */}

                    {/* {hasPermission("Products") || hasPermission("Customers") || hasPermission("Orders") ? ( */}
                    {usertype !== 'Staff' && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}>
                            {/* {hasPermission("Products") &&  */}
                            <PermissionButton navigation={navigation} route="Userslist" image="users" label="Staffs" />
                            <PermissionButton navigation={navigation} route="Customerlist" image="customers" label="Customers" />
                            <PermissionButton navigation={navigation} route="OrderList" image="orders" label="Orders" />

                            {/* {hasPermission("Customers") && */}
                            {/* <PermissionButton navigation={navigation} route="VendorsList" image="customers" label="Vendors" /> */}


                            {/* {hasPermission("Orders") &&  */}

                        </View>
                    )}
                    {/* ) : null} */}

                    {/* {hasPermission("Market Visit") || hasPermission("Delivery Report") || hasPermission("Sales Report") ? ( */}
                    {usertype !== 'Staff' && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}>
                            {/* {hasPermission("Market Visit") &&  */}
                            {/* <PermissionButton navigation={navigation} route="Marketvisit" image="products" label="Market Visit" /> */}
                            <PermissionButton navigation={navigation} route="VendorsList" image="customers" label="Vendors" />

                            <PermissionButton navigation={navigation} route="Purchaselist" image="purchase" label="Purchase" />
                            <PermissionButton navigation={navigation} route="Servicelist" image="service" label="service" />

                            {/* {hasPermission("Sales Report") && */}
                            {/* <PermissionButton navigation={navigation} route="SalesReport" image="sales" label="Sales Report" /> */}
                            {/* <PermissionButton navigation={navigation} route="SubCategorylist" image="category" label="Sub Category" /> */}
                            {/* {hasPermission("Delivery Report") &&  */}
                            {/* <PermissionButton navigation={navigation} route="Deliveryreport" image="sales" label="Delivery Report" /> */}

                        </View>
                    )}
                    {/* // ) : null} */}

                    {/* {hasPermission("Delivery Man Report") || hasPermission("Customer Type") || hasPermission("Payment Type1") ? ( */}
                    {usertype == 'Staff' && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}>
                            {/* {hasPermission("Payment Type1") && */}
                            {/* <PermissionButton navigation={navigation} route="PaymentList" image="payment" label="Payment Type" /> */}
                            <PermissionButton navigation={navigation} route="AttendanceList" image="attendance" label="Attendance" />

                            {/* {hasPermission("Customer Type") && */}
                            {/* <PermissionButton navigation={navigation} route="Customercategory" image="customer" label="Customer Type" /> */}

                            {/* {hasPermission("Delivery Man Report") && */}
                            {/* <PermissionButton navigation={navigation} route="DeliveryManReport" image="deliveryman" label="Delivery Man Report" /> */}

                        </View>
                    )}
                    {/* ) : null} */}

                    {/* {hasPermission("Party Ledger") || hasPermission("Salesman Report") || hasPermission("LMTD") ? ( */}

                    {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}> */}
                    {/* {hasPermission("Salesman Report") &&  */}
                    {/* <PermissionButton navigation={navigation} route="Salesmanreport" image="sales" label="Salesman Report" /> */}

                    {/* {hasPermission("Party Ledger") &&  */}
                    {/* <PermissionButton navigation={navigation} route="Partyledger" image="ledger" label="Party Ledger" /> */}

                    {/* {hasPermission("LMTD") &&  */}
                    {/* <PermissionButton navigation={navigation} route="LMTDReport" image="products" label="LMTD" /> */}

                    {/* </View> */}
                    {/* ) : null} */}

                    {/* {hasPermission("Stock Entry") || hasPermission("Stock Report") || hasPermission("Purchase Entry") ? ( */}

                    {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}> */}
                    {/* {hasPermission("Stock Entry") && */}
                    {/* <PermissionButton navigation={navigation} route="Stockentrylist" image="product" label="Stock Entry" /> */}

                    {/* {hasPermission("Stock Report") && */}
                    {/* <PermissionButton navigation={navigation} route="StockReport" image="stock" label="Stock Report" /> */}

                    {/* {hasPermission("Purchase Entry") && */}
                    {/* <PermissionButton navigation={navigation} route="Purchaseentry" image="purchase" label="Purchase Entry" /> */}

                    {/* </View> */}
                    {/* ) : null} */}

                    {/* {hasPermission("BDM Target") || hasPermission("My Target") || hasPermission("UPI Payments") ? (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}>
                                    {hasPermission("BDM Target") && <PermissionButton navigation={navigation} route="BDMUsers" image="target" label="BDM Target" />}
                                    {hasPermission("My Target") && <PermissionButton navigation={navigation} route="MyTargets" image="target" label="My Target" />}
                                    {hasPermission("UPI Payments") && <PermissionButton navigation={navigation} route="UPIlist" image="upi" label="UPI Payments" />}
                                </View>
                            ) : null} */}

                    {/* {hasPermission("Schemes") || hasPermission("Line") || hasPermission("Calculator") ? (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}>
                                    {hasPermission("Schemes") && <PermissionButton navigation={navigation} route="Schemeslist" image="scheme" label="Schemes" />}
                                    {hasPermission("Line") && <PermissionButton navigation={navigation} route="Lines" image="sales" label="Line" />}
                                    {hasPermission("Calculator") && <PermissionButton navigation={navigation} route="Calculatorlist" image="calculator" label="Calculator" />}
                                </View>
                            ) : null} */}

                    {/* {hasPermission('Show Margin') ? ( */}
                    {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}> */}
                    {/* {hasPermission("Show Margin") &&  */}
                    {/* <PermissionButton navigation={navigation} route="MarginReport" image="sales" label="Margin Report" /> */}

                    {/* </View> */}
                    {/* ) : null} */}


                    {/* {hasPermission("Staff") || hasPermission("Festive") || hasPermission("Staff Attendance") || hasPermission('Payment Masters') || hasPermission('Payment Report') ? ( */}
                    {/* <> */}
                    {/* Section Header */}
                    {/* <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#173161', paddingVertical: 8, paddingHorizontal: 12, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginTop: 20, elevation: 3, }} >
                                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: '#fff', flex: 1, textAlign: 'center', }} >
                                        🎉 Festival Menus 🎉
                                    </Text>
                                </View> */}
                    {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}> */}
                    {/* {hasPermission("Festive") &&  */}
                    {/* <PermissionButton navigation={navigation} route="FestiveOrderlist" image="festive" label="Festive" /> */}

                    {/* {hasPermission("Staff") &&  */}
                    {/* <PermissionButton navigation={navigation} route="FestiveStafflist" image="staff" label="Staff" /> */}

                    {/* {hasPermission("Staff Attendance") && */}
                    {/* <PermissionButton navigation={navigation} route="StaffAttendancelist" image="attendance" label="Staff Attendance" /> */}

                    {/* </View> */}
                    {/* </> */}
                    {/* ) : null} */}

                    {/* {hasPermission('Payment Masters') || hasPermission('Payment Report') ? ( */}
                    {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, backgroundColor: '#fff', borderRadius: 10, borderWidth: 0.5, borderColor: '#DCDCDC', elevation: 5, marginTop: 10 }}> */}
                    {/* {hasPermission("Payment Report") && */}
                    {/* <PermissionButton navigation={navigation} route="FestivePayementReport" image="festive" label="Payment Report" /> */}

                    {/* // {hasPermission("Payment Masters") && */}
                    {/* <PermissionButton navigation={navigation} route="FestiveCustomers" image="staff" label="Payment Masters" /> */}

                    {/* </View> */}
                    {/* ) : null} */}

                </ScrollView>
                {/* {hasOrderAddPermission && ( */}
                {/* Sticky Create Order Button */}
                <View style={{
                    position: 'absolute',
                    bottom: 15,
                    alignSelf: 'center', // ✅ center horizontally
                    zIndex: 10,


                }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('SearchCustomer')}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#0a326e',
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            borderRadius: 25,
                            elevation: 6,
                            shadowColor: '#000',
                            shadowOpacity: 0.2,
                            shadowOffset: { width: 0, height: 3 },
                            shadowRadius: 4,
                        }}
                    >
                        <Image
                            source={require('../assets/trolley.png')} // 👈 Add your icon image here
                            style={{
                                height: 20,
                                width: 20,
                                tintColor: '#fff',
                                marginRight: 8,
                            }}
                        />
                        <Text style={{
                            color: '#fff',
                            fontSize: 16,
                            fontFamily: 'Inter-SemiBold',
                        }}>
                            Create New Order
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* )} */}
            </View>



            <Modal visible={isModalVisible} onDismiss={closeModal} contentContainerStyle={{ backgroundColor: 'white', borderRadius: 10, padding: 10, width: '85%', height: '70%', alignSelf: 'center', }} >
                {modalStep == "product" ? (
                    <>
                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#173161', paddingBottom: 20, marginLeft: 10 }}>Pending Order Summary</Text>
                        <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
                            {stockdata.map((item, index) => (
                                <View key={index} style={{ borderRadius: 10, padding: 10, borderColor: '#cccccc', borderWidth: 1, backgroundColor: '#fff', marginBottom: 5, }} >
                                    <View style={{ flexDirection: 'row', gap: 5 }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', textTransform: 'capitalize', }} >Product: </Text>
                                        <Text style={{ width: '70%', fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }} >{item.product_name}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 5 }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', textTransform: 'capitalize', }} >Order Pending:</Text>
                                        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }} >({item.total_qty} Box)</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 5 }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', textTransform: 'capitalize', }} >Available Stock:</Text>
                                        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }} >({item.stock_qty} Box)</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 5 }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', textTransform: 'capitalize', }} >Remaining Stock:</Text>
                                        <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }} >({item.stock_qty - item.total_qty} Box)</Text>
                                    </View>
                                </View>
                            ))}

                            <View style={{ flexDirection: 'row', gap: 5, borderColor: '#cccccc', borderWidth: 1, borderRadius: 10, padding: 10, backgroundColor: '#81b3fe' }}>
                                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', textTransform: 'capitalize', }} >Today's Total Order:</Text>
                                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color: '#173161' }}>
                                    ({stockdata.reduce((sum, item) => sum + Number(item.total_qty), 0)} Box)
                                </Text>
                            </View>
                        </ScrollView>
                    </>
                ) : (
                    duebills.length > 0 && (
                        <>
                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: '#173161', paddingBottom: 10, marginLeft: 10 }}>
                                Due Bills
                            </Text>

                            <ScrollView>
                                <View style={{ flexDirection: 'row', width: '97%', gap: 2 }}>
                                    <Text style={{ width: '58%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', textTransform: 'uppercase', marginBottom: 10 }}>{duebills[currentCompanyIndex].company_name} ({duebills[currentCompanyIndex].credit_days})</Text>
                                    <Text style={{ width: '20%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', textTransform: 'uppercase', marginBottom: 10, textAlign: 'right' }}>{duebills[currentCompanyIndex].total_amount}</Text>
                                    <Text style={{ width: '20%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', textTransform: 'uppercase', marginBottom: 10, textAlign: 'right' }}>{duebills[currentCompanyIndex].total_due_amount}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', width: '97%', gap: 2 }}>
                                    <Text style={{ width: "27%", fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161', textTransform: 'uppercase', textAlign: 'center' }}>Date</Text>
                                    <Text style={{ width: "15%", fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161', textAlign: 'center' }}>Order No</Text>
                                    <Text style={{ width: "15%", fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161', textAlign: 'center' }}>Due Days</Text>
                                    <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>Order Amt</Text>
                                    <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>Due Amt</Text>
                                </View>
                                {duebills[currentCompanyIndex].orders.map((order, orderIndex) => (
                                    <View key={orderIndex} style={{ flexDirection: 'row', width: '97%', gap: 2 }}>
                                        <Text style={{ width: "27%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.date}</Text>
                                        <Text style={{ width: "15%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000', textAlign: 'center' }}>{order.order_no}</Text>
                                        <Text style={{ width: "15%", fontFamily: 'Inter-Regular', fontSize: 12, color: '#000', textAlign: 'center' }}>{order.days_since_entry}</Text>
                                        <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.total_price}</Text>
                                        <Text style={{ width: "20%", textAlign: 'right', fontFamily: 'Inter-Regular', fontSize: 12, color: '#000' }}>{order.due_amount}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )
                )}
                <View style={{ marginTop: 10 }}>
                    <TouchableOpacity onPress={handleOkPress} style={{ width: "100%", backgroundColor: '#0a326e', paddingVertical: 7, borderRadius: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Medium' }}>
                            OK
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Logout Confirmation Modal */}
            <Modal
                visible={logoutModalVisible}
                onDismiss={() => setLogoutModalVisible(false)}
                contentContainerStyle={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 20,
                    width: '80%',
                    alignSelf: 'center',
                }}
            >

                <View style={{ alignItems: 'center' }}>
                    <Image
                        source={require('../assets/log-out.png')}
                        style={{ height: 50, width: 50, tintColor: '#173161', marginBottom: 10 }}
                    />
                    <Text
                        style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 18,
                            color: '#173161',
                            marginBottom: 8,
                        }}
                    >
                        Confirm Logout
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
                        Are you sure you want to logout?
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <TouchableOpacity
                            onPress={() => setLogoutModalVisible(false)}
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
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={confirmLogout}
                            style={{
                                flex: 1,
                                backgroundColor: '#173161',
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
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </Modal>
            <Modal
                visible={CloseAppModal}
                onDismiss={closeExitModal}
                contentContainerStyle={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 20,
                    width: '80%',
                    alignSelf: 'center',
                }}
            >
                <View style={{ alignItems: 'center' }}>

                    <Text
                        style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 18,
                            color: '#173161',
                            marginBottom: 8,
                        }}
                    >
                        Confirmation
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
                        Are you sure you want to Really Exit ?
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <TouchableOpacity
                            onPress={closeExitModal}
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

                        <TouchableOpacity
                            onPress={confirmExit}
                            style={{
                                flex: 1,
                                backgroundColor: '#173161',
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
            </Modal>

        </View >
    );
};

const PermissionButton = ({ navigation, route, image, label }) => (
    <TouchableOpacity onPress={() => navigation.navigate(route)} style={{ width: 110, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center' }}>
        <View style={{ height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dcdcdc' }}>
            <Image source={images[image]} style={{ height: 20, width: 20, tintColor: '#173161', resizeMode: 'contain' }} />
        </View>
        <Text style={{ fontFamily: 'Inter-SemiBold', color: '#173161', fontSize: 14, textAlign: 'center' }}>{label}</Text>
    </TouchableOpacity>
);

export default Dashboard;