import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, Modal } from 'react-native';
import React, { useState } from 'react';
import Subheader from '../Commoncomponent/Subheader';
import DateTimePicker from '@react-native-community/datetimepicker';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LMTDReport = ({ navigation }) => {

    const calculateInitialDates = () => {
        const today = new Date();

        // Check if today is a valid date
        if (isNaN(today.getTime())) {
            return {
                initialFromDate: new Date(),
                initialToDate: new Date(),
                initialStartDate: new Date(),
                initialEndDate: new Date()
            };
        }

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // From Date - First date of current month
        const initialFromDate = new Date(currentYear, currentMonth, 1);

        // To Date - Today's date
        const initialToDate = new Date(today);

        // Start Date - First date of last month
        const lastMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;
        const initialStartDate = new Date(lastMonthYear, lastMonth, 1);

        // End Date - Corresponding date of today in last month
        const lastDayOfLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
        const endDateDay = Math.min(today.getDate(), lastDayOfLastMonth);
        const initialEndDate = new Date(lastMonthYear, lastMonth, endDateDay);

        return {
            initialFromDate,
            initialToDate,
            initialStartDate,
            initialEndDate
        };
    };


    // Destructure initial dates
    const {
        initialFromDate,
        initialToDate,
        initialStartDate,
        initialEndDate
    } = calculateInitialDates();

    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [showFromDate, setShowFromDate] = useState(false);
    const [showToDate, setShowToDate] = useState(false);

    const [data, setData] = useState([]);
    const [removeditems, setRemoveditem] = useState([]);
    const [mainloading, setMainloading] = useState(false);
    const [customerid, setCustomerid] = useState(null);
    const [customername, setCustomername] = useState(null);
    const [removed_party, setRemoved_party] = useState(null);
    const [modalvisible, setModalvisible] = useState(false);
    const [removemodal, setRemovemodal] = useState(false);
    const [display, setDisplay] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
    const [permissions, setPermissions] = useState([]);
    const [productsummary, setProductSummary] = useState([]);
    const [grandavg, setGrandavg] = useState(null);
    const [lastmonthbottle, setLastMonthBottle] = useState(null);

    const listPermissions = async () => {
        setMainloading(true);
        const id = await AsyncStorage.getItem('admin_id');
        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id }),
        });
        const result = await response.json();
        if (result.code == "200") {
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
        setMainloading(false);
    };

    // Function to format date to DD/MM/YYYY
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Display values for all dates
    const displayFromDate = formatDate(fromDate);
    const displayToDate = formatDate(toDate);
    const displayStartDate = formatDate(startDate);
    const displayEndDate = formatDate(endDate);

    // Show Date Pickers
    const showStartDatePicker = () => {
        setShowStartDate(true);
    };

    const showEndDatePicker = () => {
        setShowEndDate(true);
    };

    const showFromDatePicker = () => {
        setShowFromDate(true);
    };

    const showToDatePicker = () => {
        setShowToDate(true);
    };


    // Date Change Handlers
    const onStartDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        if (currentDate <= endDate) { // Ensure start date is not after end date
            setShowStartDate(false);
            setStartDate(currentDate);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || endDate;
        if (currentDate >= startDate) { // Ensure end date is not before start date
            setShowEndDate(false);
            setEndDate(currentDate);
        }
    };

    const onFromDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || fromDate;
        setShowFromDate(false);
        if (currentDate <= toDate) { // Ensure From Date is not after To Date
            setFromDate(currentDate);
        }
    };

    const onToDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || toDate;
        setShowToDate(false);
        if (currentDate >= fromDate) { // Ensure To Date is not before From Date
            setToDate(currentDate);
        }
    };

    const today = new Date();

    const formatDateToDatabase = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
    };

    const fetchdata = async () => {
        setMainloading(true);
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);
        const formattedfromDate = formatDateToDatabase(fromDate);
        const formattedtoDate = formatDateToDatabase(toDate);

        const url = `${Constant.URL}${Constant.OtherURL.lmtd_report}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedstartDate,
                end_date: formattedendDate,
                to_date: formattedtoDate,
                from_date: formattedfromDate
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setData(result.payload);
            setRemoved_party(result.display_no);
            setLastMonthBottle(result.last_month_bottle);
        } else {
            setData([]);
            console.log('error while fetching LMTD Report');
        }
        setMainloading(false);
    };

    const fetchremovedparties = async () => {
        setMainloading(true);
        const formattedstartDate = formatDateToDatabase(startDate);
        const formattedendDate = formatDateToDatabase(endDate);
        const formattedfromDate = formatDateToDatabase(fromDate);
        const formattedtoDate = formatDateToDatabase(toDate);

        const url = `${Constant.URL}${Constant.OtherURL.lmtd_display_no_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                start_date: formattedstartDate,
                end_date: formattedendDate,
                to_date: formattedtoDate,
                from_date: formattedfromDate
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setRemovemodal(true);
            setRemoveditem(result.payload);
        } else {
            setRemoveditem([]);
            console.log('error while fetching sales Report');
        }
        setMainloading(false);
    };

    const fetchproductsummary = async () => {
        // setMainloading(true);
        const formattedfromDate = formatDateToDatabase(fromDate);
        const formattedtoDate = formatDateToDatabase(toDate);

        const url = `${Constant.URL}${Constant.OtherURL.lmtd_summary}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_date: formattedfromDate,
                to_date: formattedtoDate,
            }),
        });
        const result = await response.json();
        if (result.code == 200) {
            setProductSummary(result.payload);
            setGrandavg(result.grand_avg);
        } else {
            setProductSummary([]);
            console.log('error while fetching LMTD Summary');
        }
        // setMainloading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchdata();
        }, [startDate, endDate, fromDate, toDate])
    );

    useFocusEffect(
        React.useCallback(() => {
            listPermissions();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
            fetchproductsummary();
        }, [fromDate, toDate])
    );

    const lmtd_display_status = async (customerid, display) => {
        setMainloading(true);
        const url = `${Constant.URL}${Constant.OtherURL.lmtd_display_update}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: customerid,
                display: display
            }),
        });
        const result = await response.json();
        if (result.code == "200") {
            setModalvisible(false);
            setRemovemodal(false);
            setCustomername(null);
            fetchdata();
        } else {
            console.log('error while updating display status');
        }
        setMainloading(false);
    };

    const openModal = (item, x, y) => {
        setModalPosition({ top: y - 15, left: x - 110 });
        setCustomerid(item.customer_id);
        setCustomername(item.company_name);
        setDisplay(item.display);
        setModalvisible(true);
        setRemovemodal(false);
    };

    const totalcount = data.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
    const totalBoxSum = data.reduce((sum, item) => sum + parseInt(item.total_qty || 0), 0);
    const pretotalcount = data.reduce((sum, item) => sum + parseFloat(item.last_month_amount || 0), 0);
    const pretotalBoxSum = data.reduce((sum, item) => sum + parseInt(item.last_month_qty || 0), 0);
    const isLastMonthDataZero = data.every(item => item.last_month_qty === 0 && item.last_month_amount === 0);
    const currentMonthBottle = productsummary.reduce(
        (sum, sub) => sum + sub.products.reduce((s, p) => s + parseFloat(p.pcs || 0), 0),
        0
    );

    const truncateToTwo = (num) => {
        if (!num) return "0.00";
        const str = num.toString();
        if (str.includes(".")) {
            const [int, dec] = str.split(".");
            return int + "." + (dec.substring(0, 2).padEnd(2, "0"));
        }
        return str + ".00";
    };

    const grandTotalSupply = (productsummary && productsummary.length) ? productsummary.reduce(
        (sum, sub) => sum + sub.products.reduce(
            (s, p) => s + ((parseFloat(p.total_box || 0) * parseFloat(p.avg || 0)) || 0),
            0
        ),
        0
    ) : 0;

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername="LMTD Report" />
            <ScrollView style={{ flex: 1, marginHorizontal: 10 }}>
                {/* From Date and To Date */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '48%' }}>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', marginBottom: 5, marginLeft: 10 }}>
                            From:
                        </Text>
                        <TouchableOpacity onPress={showFromDatePicker} style={{ borderWidth: 0.5, borderColor: 'gray', borderRadius: 10, padding: 15 }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>
                                {displayFromDate}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '48%' }}>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', marginBottom: 5, marginLeft: 10 }}>
                            From:
                        </Text>
                        <TouchableOpacity onPress={showStartDatePicker} style={{ borderWidth: 0.5, borderColor: 'gray', borderRadius: 10, padding: 15 }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>
                                {displayStartDate}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* Start Date and End Date */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                    <View style={{ width: '48%' }}>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', marginBottom: 5, marginLeft: 10 }}>
                            To:
                        </Text>
                        <TouchableOpacity onPress={showToDatePicker} style={{ borderWidth: 0.5, borderColor: 'gray', borderRadius: 10, padding: 15 }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>
                                {displayToDate}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: '48%' }}>
                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161', marginBottom: 5, marginLeft: 10 }}>
                            To:
                        </Text>
                        <TouchableOpacity onPress={showEndDatePicker} style={{ borderWidth: 0.5, borderColor: 'gray', borderRadius: 10, padding: 15 }}>
                            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>
                                {displayEndDate}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>


                {/* Start Date Picker */}
                {showStartDate && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        is24Hour={false}
                        display="default"
                        onChange={onStartDateChange}
                        maximumDate={today}
                    />
                )}

                {/* End Date Picker */}
                {showEndDate && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        is24Hour={false}
                        display="default"
                        onChange={onEndDateChange}
                        maximumDate={today}
                    />
                )}

                {/* From Date Picker */}
                {showFromDate && (
                    <DateTimePicker
                        value={fromDate}
                        mode="date"
                        is24Hour={false}
                        display="default"
                        onChange={onFromDateChange}
                        maximumDate={today}
                    />
                )}

                {/* To Date Picker */}
                {showToDate && (
                    <DateTimePicker
                        value={toDate}
                        mode="date"
                        is24Hour={false}
                        display="default"
                        onChange={onToDateChange}
                        maximumDate={today}
                    />
                )}

                {mainloading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                        <ActivityIndicator size="large" color="#173161" />
                    </View>
                ) :
                    <>
                        {permissions?.LMTD?.["LMTD Report"] && data && data.length > 0 && (
                            // <ScrollView horizontal={true} keyboardShouldPersistTaps='handled'>
                            <>
                                {removed_party != 0 &&
                                    <TouchableOpacity onPress={fetchremovedparties} style={{ marginTop: 5, alignItems: 'flex-end' }}>
                                        <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold' }}>Removed Parties from LMTD: {removed_party}</Text>
                                    </TouchableOpacity>
                                }
                                <View style={{ marginHorizontal: 0, borderRadius: 10, padding: 0, marginBottom: 5, marginTop: 10, borderColor: '#173161', borderWidth: 1, backgroundColor: '#fff' }}>
                                    <View style={{ flexDirection: 'row', backgroundColor: '#eaf0fa', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                                        <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 12 }}>SR. No</Text>
                                        </View>
                                        <View style={{ width: '32%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 10, fontSize: 14 }}>Party Name</Text>
                                        </View>

                                        <View style={{ width: '30%', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 10 }}>{displayStartDate} - {displayEndDate}</Text>
                                            <View style={{ flex: 1, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#173161' }}>
                                                <Text style={{ width: '44%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#173161', color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 10 }}>Box</Text>
                                                <Text style={{ width: '56.5%', textAlign: 'center', color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 10 }}>Amount</Text>
                                            </View>
                                        </View>

                                        <View style={{ width: '30%', alignItems: 'center', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 10 }}>{displayFromDate} - {displayToDate}</Text>
                                            <View style={{ flex: 1, flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#173161' }}>
                                                <Text style={{ width: '43%', textAlign: 'center', borderRightWidth: 1, borderRightColor: '#173161', color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 10 }}>Box</Text>
                                                <Text style={{ width: '56.5%', textAlign: 'center', color: '#173161', fontFamily: 'Inter-SemiBold', fontSize: 10 }}>Amount</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* {data.map((item, index) => ( */}
                                    {data.filter(item => item.display == "Yes").map((item, index) => (
                                        <TouchableOpacity key={index} onLongPress={(e) => {
                                            const { pageX, pageY } = e.nativeEvent;
                                            openModal(item, pageX, pageY);
                                        }} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161', backgroundColor: index % 2 != 0 ? '#e6ecff' : 'transparent' }}>
                                            <View style={{ width: '8%', borderRightWidth: 1, borderColor: '#173161', paddingVertical: 10, alignItems: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', fontSize: 10 }}>{index + 1}</Text>
                                            </View>
                                            <View style={{ width: '32%', borderRightWidth: 1, flexDirection: 'row', borderColor: '#173161', paddingVertical: 3, paddingLeft: 5 }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', textAlign: 'left', fontSize: 10, textTransform: 'uppercase' }}>
                                                    {item.company_name}{item.area ? ` (${item.area})` : ''}
                                                </Text>
                                            </View>

                                            <View style={{ width: '13%', borderRightWidth: 1, borderColor: '#173161', paddingRight: 3, justifyContent: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', textAlign: 'right', fontSize: 10, textTransform: 'uppercase' }}>
                                                    {item.last_month_qty}
                                                </Text>
                                            </View>

                                            <View style={{ width: '17%', justifyContent: 'center', borderRightWidth: 1, paddingRight: 3, borderColor: '#173161', }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', textAlign: 'right', fontSize: 10, textTransform: 'uppercase' }}>
                                                    {item.last_month_amount}
                                                </Text>
                                            </View>

                                            <View style={{ width: '13%', borderRightWidth: 1, borderColor: '#173161', paddingRight: 3, justifyContent: 'center' }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', textAlign: 'right', fontSize: 10, textTransform: 'uppercase' }}>
                                                    {item.total_qty}
                                                </Text>
                                            </View>

                                            <View style={{ width: '17%', justifyContent: 'center', paddingRight: 3, }}>
                                                <Text style={{ color: '#173161', fontFamily: 'Inter-Medium', textAlign: 'right', fontSize: 10, textTransform: 'uppercase' }}>
                                                    {item.total_amount}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                        <View style={{ width: '40%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', paddingVertical: 5, }}>Total</Text>
                                        </View>

                                        <View style={{ width: '13%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', paddingRight: 3 }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase', textAlign: 'right' }}>{pretotalBoxSum}</Text>
                                        </View>

                                        <View style={{ width: '17%', justifyContent: 'center', paddingRight: 3, borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase', textAlign: 'right' }}>{pretotalcount}</Text>
                                        </View>

                                        <View style={{ width: '13%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', paddingRight: 3 }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase', textAlign: 'right' }}>{totalBoxSum}</Text>
                                        </View>

                                        <View style={{ width: '17%', justifyContent: 'center', paddingRight: 3 }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase', textAlign: 'right' }}>{totalcount}</Text>
                                        </View>

                                    </View>

                                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161' }}>
                                        <View style={{ width: '40%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', paddingVertical: 5, }}></Text>
                                        </View>

                                        <View style={{ width: '13%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', paddingRight: 3 }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase', textAlign: 'right' }}>{lastmonthbottle}</Text>
                                        </View>

                                        <View style={{ width: '17%', justifyContent: 'center', paddingRight: 3, borderRightWidth: 1, borderColor: '#173161', }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase', textAlign: 'right' }}>
                                                {pretotalBoxSum > 0 ? (pretotalcount / pretotalBoxSum).toFixed(2) : 0}
                                            </Text>
                                        </View>

                                        <View style={{ width: '13%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', paddingRight: 1 }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase', textAlign: 'right' }}>{currentMonthBottle}</Text>
                                        </View>

                                        <View style={{ width: '17%', justifyContent: 'center', paddingRight: 3 }}>
                                            <Text style={{ color: '#173161', fontFamily: 'Inter-Bold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase', textAlign: 'right' }}>
                                                {totalBoxSum > 0 ? (totalcount / totalBoxSum).toFixed(2) : 0}
                                            </Text>
                                        </View>

                                    </View>
                                </View>
                            </>
                        )}

                        {/* ----------------- LMTD Summary ----------------- */}
                        {permissions?.LMTD?.["LMTD Summary"] && productsummary && productsummary.length > 0 && (
                            <View style={{ marginTop: 15, marginBottom: 10 }}>

                                <View style={{ backgroundColor: '#fff', padding: 5 }}>
                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161', textAlign: 'center' }}>
                                        Product Wise Order Summary
                                    </Text>
                                </View>
                                {productsummary.map((subcategory, subIndex) => {
                                    const totalQty = subcategory.products.reduce((sum, p) => sum + parseFloat(p.total_box || 0), 0);
                                    const totalPcs = subcategory.products.reduce((sum, p) => sum + parseFloat(p.pcs || 0), 0);
                                    const totalSupply = subcategory.products.reduce(
                                        (sum, p) => sum + ((parseFloat(p.total_box || 0) * parseFloat(p.avg || 0)) || 0),
                                        0
                                    );

                                    // percent of this subcategory of grand total
                                    const totalSupplyPercent = grandTotalSupply
                                        ? parseFloat(((totalSupply / grandTotalSupply) * 100).toFixed(2))
                                        : 0;

                                    return (
                                        <View key={subIndex} style={{ marginTop: 10, borderWidth: 1, borderColor: '#173161', borderRadius: 10, backgroundColor: '#fff', overflow: "hidden" }}>
                                            {/* Subcategory Header */}
                                            <View style={{ backgroundColor: '#eaf0fa', flexDirection: 'row' }}>
                                                <View style={{ width: '35%', paddingVertical: 5, paddingHorizontal: 6, borderRightWidth: 1, borderColor: '#173161' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#173161' }}>
                                                        {subcategory.subcategory_name}
                                                    </Text>
                                                </View>
                                                <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', textAlignVertical: 'center' }}>
                                                        Bottle
                                                    </Text>
                                                </View>
                                                <View style={{ width: '17%', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', textAlignVertical: 'center' }}>
                                                        Box
                                                    </Text>
                                                </View>
                                                <View style={{ width: '13%', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', textAlignVertical: 'center' }}>
                                                        Avg Price
                                                    </Text>
                                                </View>
                                                <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', textAlignVertical: 'center' }}>
                                                        Supply
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Product Rows */}
                                            {subcategory.products.map((prod, prodIndex) => {
                                                const prodSupply = (parseFloat(prod.total_box || 0) * parseFloat(prod.avg || 0)) || 0;
                                                const prodSupplyPercent = grandTotalSupply
                                                    ? ((prodSupply / grandTotalSupply) * 100).toFixed(2)
                                                    : "0";

                                                return (
                                                    <View key={prodIndex} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161', }}>
                                                        <View style={{ width: '35%', paddingHorizontal: 6, borderRightWidth: 1, borderColor: '#173161' }}>
                                                            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 10, color: '#173161' }}>
                                                                {prod.product_name}
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: '20%', padding: 6, alignItems: 'flex-end', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center' }}>
                                                            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 10, color: '#173161', textAlignVertical: 'center' }}>
                                                                {prod.pcs}
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: '17%', padding: 6, borderRightWidth: 1, borderColor: '#173161', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 10, color: '#173161', textAlignVertical: 'center' }}>
                                                                {prod.total_box}
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: '13%', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 10, color: '#173161', textAlignVertical: 'center' }}>
                                                                {truncateToTwo(prod.avg)}
                                                            </Text>
                                                        </View>
                                                        <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={{ fontFamily: 'Inter-Medium', fontSize: 10, color: '#173161', textAlignVertical: 'center' }}>
                                                                {prodSupplyPercent}%
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )
                                            })}

                                            {/* Totals Row */}
                                            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161', backgroundColor: '#eaf0fa' }}>
                                                <View style={{ width: '35%', padding: 6, borderRightWidth: 1, borderColor: '#173161' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>Total</Text>
                                                </View>
                                                <View style={{ width: '20%', padding: 6, alignItems: 'flex-end', borderRightWidth: 1, borderColor: '#173161' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>{totalPcs}</Text>
                                                </View>
                                                <View style={{ width: '17%', padding: 6, alignItems: 'flex-end', borderRightWidth: 1, borderColor: '#173161' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161' }}>{totalQty}</Text>
                                                </View>
                                                <View style={{ width: '13%', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161', textAlignVertical: 'center' }}>
                                                        {truncateToTwo(subcategory.subcategory_avg)}
                                                    </Text>
                                                </View>
                                                <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: '#173161', textAlignVertical: 'center' }}>
                                                        {(totalSupplyPercent)}%
                                                    </Text>
                                                </View>

                                            </View>
                                        </View>
                                    );
                                })}

                                {/* === Grand Total Box === */}
                                <View style={{ marginTop: 10, borderWidth: 1, borderColor: '#173161', borderRadius: 12, backgroundColor: '#fff', overflow: "hidden" }}>
                                    <View style={{ backgroundColor: '#173161', paddingVertical: 6 }}>
                                        <Text style={{ fontFamily: 'Inter-Bold', fontSize: 14, color: '#fff', textAlign: 'center' }}>
                                            Grand Total
                                        </Text>
                                    </View>

                                    {/* Calculate Grand Totals */}
                                    {(() => {

                                        const grandTotalPcs = productsummary.reduce(
                                            (sum, sub) => sum + sub.products.reduce((s, p) => s + parseFloat(p.pcs || 0), 0),
                                            0
                                        );

                                        return (
                                            <View style={{ flexDirection: 'row', backgroundColor: '#eaf0fa' }}>
                                                <View style={{ width: '50%', paddingHorizontal: 10, paddingVertical: 5, borderRightWidth: 1, borderColor: '#173161' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 13, color: '#173161' }}>Total Bottle</Text>
                                                </View>
                                                <View style={{ width: '50%', paddingHorizontal: 10, paddingVertical: 5, alignItems: 'flex-end' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 13, color: '#173161' }}>{grandTotalPcs}</Text>
                                                </View>
                                            </View>
                                        );
                                    })()}

                                    {(() => {
                                        const grandTotalBox = productsummary.reduce(
                                            (sum, sub) => sum + sub.products.reduce((s, p) => s + parseFloat(p.total_box || 0), 0),
                                            0
                                        );

                                        return (
                                            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161', backgroundColor: '#eaf0fa' }}>
                                                <View style={{ width: '50%', padding: 10, borderRightWidth: 1, borderColor: '#173161' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 13, color: '#173161' }}>Total Box</Text>
                                                </View>
                                                <View style={{ width: '50%', padding: 10, alignItems: 'flex-end' }}>
                                                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 13, color: '#173161' }}>{grandTotalBox}</Text>
                                                </View>
                                            </View>
                                        );
                                    })()}
                                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#173161', backgroundColor: '#eaf0fa' }}>
                                        <View style={{ width: '50%', padding: 10, borderRightWidth: 1, borderColor: '#173161' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 13, color: '#173161' }}>Total Avg Price</Text>
                                        </View>
                                        <View style={{ width: '50%', padding: 10, alignItems: 'flex-end' }}>
                                            <Text style={{ fontFamily: 'Inter-Bold', fontSize: 13, color: '#173161' }}>{truncateToTwo(grandavg)}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}
                    </>
                }
            </ScrollView>

            <Modal visible={modalvisible} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View
                        onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#000' }}></Text>
                            <TouchableOpacity onPress={() => { setModalvisible(false); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity activeOpacity={1} style={{ marginBottom: 10, alignItems: 'center' }}>
                            {/* <Image source={require('../../assets/Edit1.png')} style={{ height: 20, width: 20, tintColor: '#173161' }} /> */}
                            <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium', color: '#173161' }}>Remove {customername} from LMTD Report</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => { lmtd_display_status(customerid, 'No') }} style={{ width: 120, backgroundColor: '#e60000', paddingVertical: 10, borderRadius: 20, alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                    Yes
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setModalvisible(false); setCustomername(''); }} style={{ width: 120, backgroundColor: '#FFF', paddingVertical: 10, borderRadius: 20, alignItems: 'center', borderColor: '#173161', borderWidth: 1 }}>
                                <Text style={{ color: '#173161', fontSize: 14, fontFamily: 'Inter-Bold' }}>
                                    No
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={removemodal} transparent={true} animationType="slide">
                <TouchableOpacity onPress={() => { setRemovemodal(false); }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View
                        onStartShouldSetResponder={(e) => e.stopPropagation()} style={{ width: '80%', backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-Regular', color: '#173161' }}>Removed Parties</Text>
                            <TouchableOpacity onPress={() => { setRemovemodal(false); }} style={{ alignSelf: 'center' }}>
                                <Image source={require('../../assets/close.png')} style={{ height: 15, width: 15, }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ borderTopWidth: 1, borderTopColor: '#173161', borderLeftWidth: 1, borderLeftColor: '#173161', borderRightWidth: 1, borderRightColor: '#173161' }}>
                            {removeditems && removeditems.map((item, index) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, borderBottomColor: '#173161', borderBottomWidth: 1 }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium', color: '#173161', padding: 10 }}>{item.company_name}</Text>
                                    <TouchableOpacity onPress={() => lmtd_display_status(item.customer_id, 'Yes')} style={{ padding: 5 }}>
                                        <Image source={require('../../assets/history.png')} style={{ height: 20, width: 20, }} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default LMTDReport