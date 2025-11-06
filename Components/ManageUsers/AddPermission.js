import { View, Text, ScrollView, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import { Checkbox } from "react-native-paper";
import MyButton from '../Commoncomponent/MyButton';
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';

const AddPermission = ({ navigation, route }) => {

    const { user_id, from } = route.params || {};
    const [permissions, setPermissions] = useState({});
    const [permissionslist, setPermissionslist] = useState([]);

    const [loading, setLoading] = useState(false);

    const listpermissions = async () => {
        const url = `${Constant.URL}${Constant.OtherURL.permision_list}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id }),
        });
        const result = await response.json();

        if (result.code == "200") {
            setPermissionslist(result.payload);

            // Prepare permissions state
            let permissionsData = {};
            result.payload.forEach((item) => {
                const permsArray = item.menu_permission.split(','); // Split permissions
                let permsObject = {};
                permsArray.forEach((perm) => {
                    permsObject[perm] = true; // Set as true for checked state
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
            if (from == 'update') {
                listpermissions();
            }
        }, [from])
    );

    const rightsData = [
        { id: 1, name: "Users" },
        { id: 2, name: "Category" },
        { id: 3, name: "Sub Category" },
        { id: 4, name: "Products" },
        { id: 5, name: "Customers" },
        { id: 6, name: "Orders" },
        { id: 7, name: "Market Visit" },
        { id: 8, name: "Order Price" },
        { id: 9, name: "Delivery Report" },
        { id: 10, name: "Payment Entry" },
        { id: 11, name: "Delivery Man Report" },
        { id: 12, name: "Sales Report" },
        { id: 13, name: "Credit Permission" },
        { id: 14, name: "Payment Type" },
        { id: 15, name: "Customer Type" },
        { id: 16, name: "Payment Type1" },
        { id: 17, name: "LMTD" },
        { id: 18, name: "Party Ledger" },
        { id: 19, name: "Salesman Report" },
        { id: 20, name: "Stock Entry" },
        { id: 21, name: "Stock Report" },
        { id: 22, name: "Pending Product Summary" },
        { id: 23, name: "Purchase Entry" },
        { id: 24, name: "BDM Target" },
        { id: 25, name: "My Target" },
        { id: 26, name: "UPI Payments" },
        { id: 27, name: "Distributor" },
        { id: 28, name: "Schemes" },
        { id: 29, name: "Voice Note" },
        { id: 30, name: "Line" },
        { id: 31, name: "Calculator" },
        { id: 32, name: "Festive" },
        { id: 33, name: "Staff" },
        { id: 34, name: "Staff Attendance" },
        { id: 35, name: "Payment Masters" },
        { id: 36, name: "Payment Report" },
        { id: 37, name: "Show Margin" },

    ];

    const togglePermission = (menuName, permissionName) => {
        setPermissions((prevPermissions) => {
            const updatedPermissions = { ...prevPermissions };

            // Check if it's a permission for "Show Rate" or "Show Total"
            if (menuName === "Order Price" && ["Show Rate", "Show Total"].includes(permissionName)) {
                updatedPermissions[menuName] = {
                    ...updatedPermissions[menuName],
                    [permissionName]: !updatedPermissions[menuName]?.[permissionName],
                };

            } else if (menuName === "Orders" && ["Add", "Update", "Delete", "Cancel"].includes(permissionName)) {
                updatedPermissions[menuName] = {
                    ...updatedPermissions[menuName],
                    [permissionName]: !updatedPermissions[menuName]?.[permissionName],
                };

            }
            else if (menuName === "Orders" && ["Add", "Update", "Delete", "Cancel"].includes(permissionName)) {
                updatedPermissions[menuName] = {
                    ...updatedPermissions[menuName],
                    [permissionName]: !updatedPermissions[menuName]?.[permissionName],
                };

            } else if (menuName === "Party Ledger" && ["Party Ledger", "Full Ledger"].includes(permissionName)) {
                updatedPermissions[menuName] = {
                    ...updatedPermissions[menuName],
                    [permissionName]: !updatedPermissions[menuName]?.[permissionName],
                };

            } else if (menuName === "Customers" && ["Add", "Update", "Delete", "Location"].includes(permissionName)) {
                updatedPermissions[menuName] = {
                    ...updatedPermissions[menuName],
                    [permissionName]: !updatedPermissions[menuName]?.[permissionName],
                };

            } else if (menuName === "Payment" && ["Bank Transfer", "Cash", "Baki", "UPI"].includes(permissionName)) {
                updatedPermissions[menuName] = {
                    ...updatedPermissions[menuName],
                    [permissionName]: !updatedPermissions[menuName]?.[permissionName],
                };
            } else if (menuName === "LMTD" && ["LMTD Report", "LMTD Summary"].includes(permissionName)) {
                updatedPermissions[menuName] = {
                    ...updatedPermissions[menuName],
                    [permissionName]: !updatedPermissions[menuName]?.[permissionName],
                };
            } else {
                // Default "Add", "Update", "Delete" permissions
                updatedPermissions[menuName] = {
                    ...updatedPermissions[menuName],
                    [permissionName]: !updatedPermissions[menuName]?.[permissionName],
                };
            }

            return updatedPermissions;
        });
    };


    const givepermission = async () => {
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.add_permision}`;
        let menuNames = [];
        let menuPermissions = {};

        rightsData.forEach(item => {
            const selectedPermissions = [];

            if (permissions[item.name]?.Add) selectedPermissions.push('Add');
            if (permissions[item.name]?.Update) selectedPermissions.push('Update');
            if (permissions[item.name]?.Delete) selectedPermissions.push('Delete');

            if (item.name == "Order Price") {
                if (permissions[item.name]?.["Show Rate"]) selectedPermissions.push('Show Rate');
                if (permissions[item.name]?.["Show Total"]) selectedPermissions.push('Show Total');
            }
            if (item.name == "Payment Type") {
                if (permissions[item.name]?.["Bank Transfer"]) selectedPermissions.push('Bank Transfer');
                if (permissions[item.name]?.["Cash"]) selectedPermissions.push('Cash');
                if (permissions[item.name]?.["Baki"]) selectedPermissions.push('Baki');
                if (permissions[item.name]?.["UPI"]) selectedPermissions.push('UPI');
            }

            if (item.name == "Customers") {
                if (permissions[item.name]?.["Add"]) selectedPermissions.push('Add');
                if (permissions[item.name]?.["Update"]) selectedPermissions.push('Update');
                if (permissions[item.name]?.["Delete"]) selectedPermissions.push('Delete');
                if (permissions[item.name]?.["Location"]) selectedPermissions.push('Location');
            }

            if (item.name == "Orders") {
                if (permissions[item.name]?.Add) selectedPermissions.push('Add');
                if (permissions[item.name]?.Update) selectedPermissions.push('Update');
                if (permissions[item.name]?.Delete) selectedPermissions.push('Delete');
                if (permissions[item.name]?.Cancel) selectedPermissions.push('Cancel');
            }

            if (item.name == "Delivery Report") {
                if (permissions[item.name]?.["Delivery Report"]) selectedPermissions.push('Delivery Report');
            }

            if (item.name == "Payment Report") {
                if (permissions[item.name]?.["Payment Report"]) selectedPermissions.push('Payment Report');
            }

            if (item.name == "My Target") {
                if (permissions[item.name]?.["My Target"]) selectedPermissions.push('My Target');
            }

            if (item.name == "Festive") {
                if (permissions[item.name]?.["Festive"]) selectedPermissions.push('Festive');
            }

            if (item.name == "Pending Product Summary") {
                if (permissions[item.name]?.["Pending Product Summary"]) selectedPermissions.push('Pending Product Summary');
            }

            if (item.name == "Stock Report") {
                if (permissions[item.name]?.["Stock Report"]) selectedPermissions.push('Stock Report');
            }

            if (item.name == "Show Margin") {
                if (permissions[item.name]?.["Show Margin"]) selectedPermissions.push('Show Margin');
            }

            if (item.name == "LMTD") {
                if (permissions[item.name]?.["LMTD Report"]) selectedPermissions.push('LMTD Report');
                if (permissions[item.name]?.["LMTD Summary"]) selectedPermissions.push('LMTD Summary');
            }

            if (item.name == "Payment Entry") {
                if (permissions[item.name]?.["Payment Mode Update"]) selectedPermissions.push('Payment Mode Update');
            }

            if (item.name == "Delivery Man Report") {
                if (permissions[item.name]?.["Delivery Man Report"]) selectedPermissions.push('Delivery Man Report');
            }

            if (item.name == "Sales Report") {
                if (permissions[item.name]?.["Sales Report"]) selectedPermissions.push('Sales Report');
            }

            if (item.name == "Salesman Report") {
                if (permissions[item.name]?.["Salesman Report"]) selectedPermissions.push('Salesman Report');
            }

            if (item.name == "Party Ledger") {
                if (permissions[item.name]?.["Party Ledger"]) selectedPermissions.push('Party Ledger');
                if (permissions[item.name]?.["Full Ledger"]) selectedPermissions.push('Full Ledger');
            }

            if (item.name == "Credit Permission") {
                if (permissions[item.name]?.["Over Limit"]) selectedPermissions.push('Over Limit');
            }

            if (item.name == "Voice Note") {
                if (permissions[item.name]?.["Voice Note"]) selectedPermissions.push('Voice Note');
            }

            if (selectedPermissions.length > 0) {
                menuNames.push(item.name);  // Ensure lowercase names if required
                menuPermissions[item.name] = selectedPermissions.join(',');
            }
        });

        const requestBody = {
            user_id: user_id,
            menu_names: menuNames,
            menu_permissions: menuPermissions
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        const result = await response.json();
        if (result.code == "200") {
            ToastAndroid.show(
                'Permissions Added successfully!',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
            );
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'Dashboard' },
                    { name: 'Userslist' }
                ],
            });
        } else {
            console.log('error while adding category');
        }
        setLoading(false);
    };

    const updategivenpermission = async () => {
        setLoading(true);
        const url = `${Constant.URL}${Constant.OtherURL.update_permision}`;
        let menuNames = [];
        let menuPermissions = {};

        rightsData.forEach(item => {
            const selectedPermissions = [];

            if (permissions[item.name]?.Add) selectedPermissions.push('Add');
            if (permissions[item.name]?.Update) selectedPermissions.push('Update');
            if (permissions[item.name]?.Delete) selectedPermissions.push('Delete');

            if (item.name == "Order Price") {
                if (permissions[item.name]?.["Show Rate"]) selectedPermissions.push('Show Rate');
                if (permissions[item.name]?.["Show Total"]) selectedPermissions.push('Show Total');
            }

            if (item.name == "Payment Type") {
                if (permissions[item.name]?.["Bank Transfer"]) selectedPermissions.push('Bank Transfer');
                if (permissions[item.name]?.["Cash"]) selectedPermissions.push('Cash');
                if (permissions[item.name]?.["Baki"]) selectedPermissions.push('Baki');
                if (permissions[item.name]?.["UPI"]) selectedPermissions.push('UPI');
            }

            if (item.name == "Customers") {
                if (permissions[item.name]?.["Add"]) selectedPermissions.push('Add');
                if (permissions[item.name]?.["Update"]) selectedPermissions.push('Update');
                if (permissions[item.name]?.["Delete"]) selectedPermissions.push('Delete');
                if (permissions[item.name]?.["Location"]) selectedPermissions.push('Location');
            }

            if (item.name == "Orders") {
                if (permissions[item.name]?.Add) selectedPermissions.push('Add');
                if (permissions[item.name]?.Update) selectedPermissions.push('Update');
                if (permissions[item.name]?.Delete) selectedPermissions.push('Delete');
                if (permissions[item.name]?.Cancel) selectedPermissions.push('Cancel');
            }

            if (item.name == "Delivery Report") {
                if (permissions[item.name]?.["Delivery Report"]) selectedPermissions.push('Delivery Report');
            }

            if (item.name == "Payment Report") {
                if (permissions[item.name]?.["Payment Report"]) selectedPermissions.push('Payment Report');
            }

            if (item.name == "My Target") {
                if (permissions[item.name]?.["My Target"]) selectedPermissions.push('My Target');
            }

            if (item.name == "Festive") {
                if (permissions[item.name]?.["Festive"]) selectedPermissions.push('Festive');
            }

            if (item.name == "Pending Product Summary") {
                if (permissions[item.name]?.["Pending Product Summary"]) selectedPermissions.push('Pending Product Summary');
            }

            if (item.name == "Stock Report") {
                if (permissions[item.name]?.["Stock Report"]) selectedPermissions.push('Stock Report');
            }

            if (item.name == "Show Margin") {
                if (permissions[item.name]?.["Show Margin"]) selectedPermissions.push('Show Margin');
            }

            if (item.name == "LMTD") {
                if (permissions[item.name]?.["LMTD Report"]) selectedPermissions.push('LMTD Report');
                if (permissions[item.name]?.["LMTD Summary"]) selectedPermissions.push('LMTD Summary');
            }

            if (item.name == "Payment Entry") {
                if (permissions[item.name]?.["Payment Mode Update"]) selectedPermissions.push('Payment Mode Update');
            }

            if (item.name == "Delivery Man Report") {
                if (permissions[item.name]?.["Delivery Man Report"]) selectedPermissions.push('Delivery Man Report');
            }

            if (item.name == "Sales Report") {
                if (permissions[item.name]?.["Sales Report"]) selectedPermissions.push('Sales Report');
            }

            if (item.name == "Salesman Report") {
                if (permissions[item.name]?.["Salesman Report"]) selectedPermissions.push('Salesman Report');
            }

            if (item.name == "Party Ledger") {
                if (permissions[item.name]?.["Party Ledger"]) selectedPermissions.push('Party Ledger');
                if (permissions[item.name]?.["Full Ledger"]) selectedPermissions.push('Full Ledger');
            }

            if (item.name == "Credit Permission") {
                if (permissions[item.name]?.["Over Limit"]) selectedPermissions.push('Over Limit');
            }

            if (item.name == "Voice Note") {
                if (permissions[item.name]?.["Voice Note"]) selectedPermissions.push('Voice Note');
            }

            if (selectedPermissions.length > 0) {
                menuNames.push(item.name);  // Ensure lowercase names if required
                menuPermissions[item.name] = selectedPermissions.join(',');
            }
        });

        const requestBody = {
            user_id: user_id,
            menu_names: menuNames,
            menu_permissions: menuPermissions
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        const result = await response.json();
        if (result.code == "200") {
            ToastAndroid.show(
                'Permissions Updated successfully!',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
            );
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'Dashboard' },
                    { name: 'Userslist' }
                ],
            });
        } else {
            console.log('error while updating permissions');
        }
        setLoading(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <Subheader headername='Rights Access' />
            <ScrollView keyboardShouldPersistTaps="handled">
                {rightsData
                    .filter(item => item.id < 31 || item.id > 36) // Adjust IDs for these sections
                    .map((item) => (
                        <View key={item.id} style={{ backgroundColor: "white", padding: 15, margin: 5, borderRadius: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, }} >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text style={{ fontSize: 14, fontFamily: "Inter-SemiBold", color: "#173161" }}>
                                    {item.name}
                                </Text>
                            </View>

                            <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
                                {item.name == "Order Price"
                                    ? // If the item is "Order Price", show "Show Rate" & "Show Total" checkboxes
                                    ["Show Rate", "Show Total"].map((perm) => (
                                        <View
                                            key={perm}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginRight: 20,
                                            }}
                                        >
                                            <Checkbox.Android
                                                status={permissions[item.name]?.[perm] ? "checked" : "unchecked"}
                                                onPress={() => togglePermission(item.name, perm)}
                                                color="#173161"
                                                uncheckedColor="#173161"
                                            />
                                            <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                {perm}
                                            </Text>
                                        </View>
                                    )) : item.name == "Payment Type"
                                        ? // If the item is "Order Price", show "Show Rate" & "Show Total" checkboxes
                                        ["Bank Transfer", "Cash", "Baki", "UPI"].map((perm) => (
                                            <View
                                                key={perm}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    marginRight: 15,
                                                }}
                                            >
                                                <Checkbox.Android
                                                    status={permissions[item.name]?.[perm] ? "checked" : "unchecked"}
                                                    onPress={() => togglePermission(item.name, perm)}
                                                    color="#173161"
                                                    uncheckedColor="#173161"
                                                />
                                                <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                    {perm}
                                                </Text>
                                            </View>
                                        )) : item.name == "Party Ledger"
                                            ? // If the item is "Order Price", show "Show Rate" & "Show Total" checkboxes
                                            ["Party Ledger", "Full Ledger"].map((perm) => (
                                                <View
                                                    key={perm}
                                                    style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        marginRight: 20,
                                                    }}
                                                >
                                                    <Checkbox.Android
                                                        status={permissions[item.name]?.[perm] ? "checked" : "unchecked"}
                                                        onPress={() => togglePermission(item.name, perm)}
                                                        color="#173161"
                                                        uncheckedColor="#173161"
                                                    />
                                                    <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                        {perm}
                                                    </Text>
                                                </View>
                                            )) : item.name == "Customers" ?
                                                ["Add", "Update", "Delete", "Location"].map((perm) => (
                                                    <View
                                                        key={perm}
                                                        style={{
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            marginRight: 20,
                                                        }}
                                                    >
                                                        <Checkbox.Android
                                                            status={permissions[item.name]?.[perm] ? "checked" : "unchecked"}
                                                            onPress={() => togglePermission(item.name, perm)}
                                                            color="#173161"
                                                            uncheckedColor="#173161"
                                                        />
                                                        <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                            {perm}
                                                        </Text>
                                                    </View>
                                                )) : item.name == "Orders" ?
                                                    ["Add", "Update", "Delete", "Cancel"].map((perm) => (
                                                        <View
                                                            key={perm}
                                                            style={{
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                marginRight: 20,
                                                            }}
                                                        >
                                                            <Checkbox.Android
                                                                status={permissions[item.name]?.[perm] ? "checked" : "unchecked"}
                                                                onPress={() => togglePermission(item.name, perm)}
                                                                color="#173161"
                                                                uncheckedColor="#173161"
                                                            />
                                                            <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                {perm}
                                                            </Text>
                                                        </View>
                                                    )) : item.name == "Delivery Report" ? (
                                                        // If the item is "Delivery Report", show only one checkbox
                                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                            <Checkbox.Android
                                                                status={permissions[item.name]?.["Delivery Report"] ? "checked" : "unchecked"}
                                                                onPress={() => togglePermission(item.name, "Delivery Report")}
                                                                color="#173161"
                                                                uncheckedColor="#173161"
                                                            />
                                                            <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                Delivery Report
                                                            </Text>
                                                        </View>
                                                    )
                                                        : item.name == "Payment Report" ? (
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Checkbox.Android
                                                                    status={permissions[item.name]?.["Payment Report"] ? "checked" : "unchecked"}
                                                                    onPress={() => togglePermission(item.name, "Payment Report")}
                                                                    color="#173161"
                                                                    uncheckedColor="#173161"
                                                                />
                                                                <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                    Payment Report
                                                                </Text>
                                                            </View>
                                                        ) : item.name == "Voice Note" ? (
                                                            // If the item is "Voice Note", show only one checkbox
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Checkbox.Android
                                                                    status={permissions[item.name]?.["Voice Note"] ? "checked" : "unchecked"}
                                                                    onPress={() => togglePermission(item.name, "Voice Note")}
                                                                    color="#173161"
                                                                    uncheckedColor="#173161"
                                                                />
                                                                <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                    Voice Note
                                                                </Text>
                                                            </View>
                                                        ) : item.name == "Festive" ? (
                                                            // If the item is "Festive", show only one checkbox
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Checkbox.Android
                                                                    status={permissions[item.name]?.["Festive"] ? "checked" : "unchecked"}
                                                                    onPress={() => togglePermission(item.name, "Festive")}
                                                                    color="#173161"
                                                                    uncheckedColor="#173161"
                                                                />
                                                                <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                    Festive
                                                                </Text>
                                                            </View>
                                                        ) : item.name == "Pending Product Summary" ? (
                                                            // If the item is "Delivery Report", show only one checkbox
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Checkbox.Android
                                                                    status={permissions[item.name]?.["Pending Product Summary"] ? "checked" : "unchecked"}
                                                                    onPress={() => togglePermission(item.name, "Pending Product Summary")}
                                                                    color="#173161"
                                                                    uncheckedColor="#173161"
                                                                />
                                                                <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                    Pending Product Summary
                                                                </Text>
                                                            </View>
                                                        ) : item.name == "Stock Report" ? (
                                                            // If the item is "Delivery Report", show only one checkbox
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Checkbox.Android
                                                                    status={permissions[item.name]?.["Stock Report"] ? "checked" : "unchecked"}
                                                                    onPress={() => togglePermission(item.name, "Stock Report")}
                                                                    color="#173161"
                                                                    uncheckedColor="#173161"
                                                                />
                                                                <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                    Stock Report
                                                                </Text>
                                                            </View>
                                                        ) : item.name == "Show Margin" ? (
                                                            // If the item is "Delivery Report", show only one checkbox
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Checkbox.Android
                                                                    status={permissions[item.name]?.["Show Margin"] ? "checked" : "unchecked"}
                                                                    onPress={() => togglePermission(item.name, "Show Margin")}
                                                                    color="#173161"
                                                                    uncheckedColor="#173161"
                                                                />
                                                                <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                    Show Margin
                                                                </Text>
                                                            </View>
                                                        ) : item.name == "My Target" ? (
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                <Checkbox.Android
                                                                    status={permissions[item.name]?.["My Target"] ? "checked" : "unchecked"}
                                                                    onPress={() => togglePermission(item.name, "My Target")}
                                                                    color="#173161"
                                                                    uncheckedColor="#173161"
                                                                />
                                                                <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                    My Target
                                                                </Text>
                                                            </View>
                                                        ) : item.name == "LMTD" ?
                                                            ["LMTD Report", "LMTD Summary"].map((perm) => (
                                                                <View
                                                                    key={perm}
                                                                    style={{
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                        marginRight: 20,
                                                                    }}
                                                                >
                                                                    <Checkbox.Android
                                                                        status={permissions[item.name]?.[perm] ? "checked" : "unchecked"}
                                                                        onPress={() => togglePermission(item.name, perm)}
                                                                        color="#173161"
                                                                        uncheckedColor="#173161"
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                        {perm}
                                                                    </Text>
                                                                </View>
                                                            )) : item.name == "Delivery Man Report" ? (
                                                                // If the item is "Delivery Report", show only one checkbox
                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                    <Checkbox.Android
                                                                        status={permissions[item.name]?.["Delivery Man Report"] ? "checked" : "unchecked"}
                                                                        onPress={() => togglePermission(item.name, "Delivery Man Report")}
                                                                        color="#173161"
                                                                        uncheckedColor="#173161"
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                        Delivery Man Report
                                                                    </Text>
                                                                </View>
                                                            ) : item.name == "Sales Report" ? (
                                                                // If the item is "Delivery Report", show only one checkbox
                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                    <Checkbox.Android
                                                                        status={permissions[item.name]?.["Sales Report"] ? "checked" : "unchecked"}
                                                                        onPress={() => togglePermission(item.name, "Sales Report")}
                                                                        color="#173161"
                                                                        uncheckedColor="#173161"
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                        Sales Report
                                                                    </Text>
                                                                </View>
                                                            ) : item.name == "Salesman Report" ? (
                                                                // If the item is "Delivery Report", show only one checkbox
                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                    <Checkbox.Android
                                                                        status={permissions[item.name]?.["Salesman Report"] ? "checked" : "unchecked"}
                                                                        onPress={() => togglePermission(item.name, "Salesman Report")}
                                                                        color="#173161"
                                                                        uncheckedColor="#173161"
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                        Salesman Report
                                                                    </Text>
                                                                </View>
                                                            ) : item.name == "Credit Permission" ? (
                                                                // If the item is "Delivery Report", show only one checkbox
                                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                    <Checkbox.Android
                                                                        status={permissions[item.name]?.["Over Limit"] ? "checked" : "unchecked"}
                                                                        onPress={() => togglePermission(item.name, "Over Limit")}
                                                                        color="#173161"
                                                                        uncheckedColor="#173161"
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                        Over Limit
                                                                    </Text>
                                                                </View>// Otherwise, show "Add", "Update", "Delete" checkboxes
                                                            ) : ["Add", "Update", "Delete"].map((perm) => (
                                                                <View
                                                                    key={perm}
                                                                    style={{
                                                                        flexDirection: "row",
                                                                        alignItems: "center",
                                                                        marginRight: 20,
                                                                    }}
                                                                >
                                                                    <Checkbox.Android
                                                                        status={permissions[item.name]?.[perm] ? "checked" : "unchecked"}
                                                                        onPress={() => togglePermission(item.name, perm)}
                                                                        color="#173161"
                                                                        uncheckedColor="#173161"
                                                                    />
                                                                    <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                                        {perm}
                                                                    </Text>
                                                                </View>
                                                            ))}
                            </View>
                        </View>
                    ))}

                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#173161', paddingVertical: 8, paddingHorizontal: 12, borderTopLeftRadius: 10, borderTopRightRadius: 10, marginTop: 10, marginHorizontal: 5, elevation: 3, }} >
                    <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: '#fff', flex: 1, textAlign: 'center', }} >
                        🎉 Festival Menus 🎉
                    </Text>
                </View>
                <View style={{ marginHorizontal: 5, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: "white", }}>
                    {rightsData
                        .filter(item => item.id > 31 && item.id <= 36) // Adjust IDs for these sections
                        .map((item) => (
                            <View key={item.id} style={{ paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 0.5, borderColor: '#ccc', marginHorizontal: 3 }} >
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Text style={{ fontSize: 14, fontFamily: "Inter-SemiBold", color: "#173161" }}>
                                        {item.name}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
                                    {item.name == "Payment Report" ? (
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Checkbox.Android
                                                status={permissions[item.name]?.["Payment Report"] ? "checked" : "unchecked"}
                                                onPress={() => togglePermission(item.name, "Payment Report")}
                                                color="#173161"
                                                uncheckedColor="#173161"
                                            />
                                            <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                Payment Report
                                            </Text>
                                        </View>
                                    ) : item.name == "Festive" ? (
                                        // If the item is "Festive", show only one checkbox
                                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                                            <Checkbox.Android
                                                status={permissions[item.name]?.["Festive"] ? "checked" : "unchecked"}
                                                onPress={() => togglePermission(item.name, "Festive")}
                                                color="#173161"
                                                uncheckedColor="#173161"
                                            />
                                            <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                Festive
                                            </Text>
                                        </View>
                                    ) : ["Add", "Update", "Delete"].map((perm) => (
                                        <View
                                            key={perm}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                marginRight: 20,
                                            }}
                                        >
                                            <Checkbox.Android
                                                status={permissions[item.name]?.[perm] ? "checked" : "unchecked"}
                                                onPress={() => togglePermission(item.name, perm)}
                                                color="#173161"
                                                uncheckedColor="#173161"
                                            />
                                            <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: "#173161" }}>
                                                {perm}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                </View>
            </ScrollView>


            {loading ?
                <ActivityIndicator size="large" color="#173161" />
                : <View style={{ margin: 10 }}>
                    <MyButton btnname="Save" background="#173161" fontsize={18} textcolor="#FFF" runFunc={from == 'update' ? updategivenpermission : givepermission} />
                </View>
            }
        </View>
    )
}

export default AddPermission