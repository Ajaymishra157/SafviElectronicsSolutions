import { View, Text, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native';
import LoginUser from '../LoginUser';
import Dashboard from '../Dashboard';
import Userslist from '../ManageUsers/Userslist';
import Categorylist from '../Managecategory/Categorylist';
import SubCategorylist from '../Managecategory/SubCategorylist';
import Productlist from '../ManageProducts/Productlist';
import Customerlist from '../Managecustomers/Customerlist';
import AddUser from '../ManageUsers/AddUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddCustomer from '../Managecustomers/AddCustomer';
import Addproduct from '../ManageProducts/Addproduct';
import Marketvisit from '../Managecustomers/Marketvisit';
import AddMarketVisit from '../Managecustomers/AddMarketVisit';
import AddSizes from '../Managecustomers/AddSizes';
import CreateOrder from '../ManageOrders/CreateOrder';
import MyProfile from '../ManageUsers/MyProfile';
import SearchCustomer from '../ManageOrders/SearchCustomer';
import OrderList from '../ManageOrders/OrderList';
import OrderDetails from '../ManageOrders/OrderDetails';
import AddPermission from '../ManageUsers/AddPermission';
import ProductPrice from '../Managecustomers/ProductPrice';

import Customercategory from '../Managecategory/Customercategory';

import PaymentList from '../ManagePayments.js/PaymentList';
import Orderwisepayments from '../ManagePayments.js/Orderwisepayments';
import CustomerwiseOrders from '../Managecustomers/CustomerwiseOrders';

import Bags from '../Managecategory/Bags';
import Preforms from '../Managecategory/Preforms';



import MergeOrder from '../ManageOrders/MergeOrder';
import BDMTargetlist from '../ManageUsers/BDMTargetlist';
import BDMUsers from '../ManageUsers/BDMUsers';
import MyTargets from '../ManageUsers/MyTargets';
import UPIlist from '../Managecategory/UPIlist';

import Schemeslist from '../ManageScheme/Schemeslist';
import AddScheme from '../ManageScheme/AddScheme';
import Lines from '../Managecategory/Lines';



import VendorsList from '../ManageVendors/VendorsList';
import AddVendor from '../ManageVendors/AddVendor';
import Purchaselist from '../ManagePurchase/Purchaselist';
import SearchPurchaseCustomer from '../ManagePurchase/SearchPurchaseCustomer';
import CreatePurchase from '../ManagePurchase/CreatePurchase';
import PurchaseDetails from '../ManagePurchase/PurchaseDetails';
import Servicelist from '../ManageService/Servicelist';
import AddService from '../ManageService/AddService';
import SearchServicecustomer from '../ManageService/SearchServicecustomer';
import OrderListService from '../ManageService/OrderListService';
import AttendanceList from '../ManageAttendance/AttendanceList';
import AddAttendance from '../ManageAttendance/AddAttendance';
import SalesReport from '../Reports/SalesReport';
import SalesReportList from '../Reports/SalesReportList';
import StockReport from '../Reports/StockReport';
import StockReportList from '../Reports/StockReportList';
import MyServices from '../ManageService/MyServices';
import StaffAttendance from '../ManageAttendance/StaffAttendance';


const Mainstack = () => {
  const stack = createStackNavigator();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const id = await AsyncStorage.getItem('admin_id');
        if (id) {
          setInitialRoute('Dashboard')
        } else {
          setInitialRoute('LoginUser');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setInitialRoute('LoginScreen');
      }
    };

    if (!initialRoute) {
      checkLoginStatus();
    }
  }, [initialRoute]);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#173161" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <stack.Navigator initialRouteName={initialRoute}>
        <stack.Screen name="LoginUser" component={LoginUser} options={{ headerShown: false }} />
        <stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
        <stack.Screen name="Userslist" component={Userslist} options={{ headerShown: false }} />
        <stack.Screen name="Categorylist" component={Categorylist} options={{ headerShown: false }} />
        <stack.Screen name="SubCategorylist" component={SubCategorylist} options={{ headerShown: false }} />
        <stack.Screen name="Productlist" component={Productlist} options={{ headerShown: false }} />
        <stack.Screen name="Customerlist" component={Customerlist} options={{ headerShown: false }} />
        <stack.Screen name="Marketvisit" component={Marketvisit} options={{ headerShown: false }} />
        <stack.Screen name="AddUser" component={AddUser} options={{ headerShown: false }} />
        <stack.Screen name="AddCustomer" component={AddCustomer} options={{ headerShown: false }} />
        <stack.Screen name="Addproduct" component={Addproduct} options={{ headerShown: false }} />
        <stack.Screen name="CreateOrder" component={CreateOrder} options={{ headerShown: false }} />
        <stack.Screen name="AddMarketVisit" component={AddMarketVisit} options={{ headerShown: false }} />
        <stack.Screen name="AddSizes" component={AddSizes} options={{ headerShown: false }} />
        <stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
        <stack.Screen name="SearchCustomer" component={SearchCustomer} options={{ headerShown: false }} />
        <stack.Screen name="OrderList" component={OrderList} options={{ headerShown: false }} />
        <stack.Screen name="OrderDetails" component={OrderDetails} options={{ headerShown: false }} />
        <stack.Screen name="AddPermission" component={AddPermission} options={{ headerShown: false }} />
        <stack.Screen name="ProductPrice" component={ProductPrice} options={{ headerShown: false }} />

        <stack.Screen name="Customercategory" component={Customercategory} options={{ headerShown: false }} />
        <stack.Screen name="PaymentList" component={PaymentList} options={{ headerShown: false }} />
        <stack.Screen name="Orderwisepayments" component={Orderwisepayments} options={{ headerShown: false }} />
        <stack.Screen name="CustomerwiseOrders" component={CustomerwiseOrders} options={{ headerShown: false }} />
        <stack.Screen name="Bags" component={Bags} options={{ headerShown: false }} />
        <stack.Screen name="Preforms" component={Preforms} options={{ headerShown: false }} />




        <stack.Screen name="MergeOrder" component={MergeOrder} options={{ headerShown: false }} />
        <stack.Screen name="BDMTargetlist" component={BDMTargetlist} options={{ headerShown: false }} />
        <stack.Screen name="BDMUsers" component={BDMUsers} options={{ headerShown: false }} />
        <stack.Screen name="MyTargets" component={MyTargets} options={{ headerShown: false }} />
        <stack.Screen name="UPIlist" component={UPIlist} options={{ headerShown: false }} />


        <stack.Screen name="Schemeslist" component={Schemeslist} options={{ headerShown: false }} />
        <stack.Screen name="AddScheme" component={AddScheme} options={{ headerShown: false }} />

        <stack.Screen name="Lines" component={Lines} options={{ headerShown: false }} />








        <stack.Screen name='VendorsList' component={VendorsList} options={{ headerShown: false }} />
        <stack.Screen name='AddVendor' component={AddVendor} options={{ headerShown: false }} />

        <stack.Screen name='Purchaselist' component={Purchaselist} options={{ headerShown: false }} />
        <stack.Screen name='SearchPurchaseCustomer' component={SearchPurchaseCustomer} options={{ headerShown: false }} />
        <stack.Screen name='CreatePurchase' component={CreatePurchase} options={{ headerShown: false }} />
        <stack.Screen name='PurchaseDetails' component={PurchaseDetails} options={{ headerShown: false }} />


        <stack.Screen name='Servicelist' component={Servicelist} options={{ headerShown: false }} />
        <stack.Screen name='AddService' component={AddService} options={{ headerShown: false }} />
        <stack.Screen name='SearchServicecustomer' component={SearchServicecustomer} options={{ headerShown: false }} />
        <stack.Screen name='OrderListService' component={OrderListService} options={{ headerShown: false }} />
        <stack.Screen name='MyServices' component={MyServices} options={{ headerShown: false }} />



        <stack.Screen name='AttendanceList' component={AttendanceList} options={{ headerShown: false }} />
        <stack.Screen name='AddAttendance' component={AddAttendance} options={{ headerShown: false }} />
        <stack.Screen name='StaffAttendance' component={StaffAttendance} options={{ headerShown: false }} />


        <stack.Screen name='SalesReport' component={SalesReport} options={{ headerShown: false }} />
        <stack.Screen name='SalesReportList' component={SalesReportList} options={{ headerShown: false }} />
        <stack.Screen name='StockReport' component={StockReport} options={{ headerShown: false }} />
        <stack.Screen name='StockReportList' component={StockReportList} options={{ headerShown: false }} />














      </stack.Navigator>
    </NavigationContainer>
  )
}

export default Mainstack