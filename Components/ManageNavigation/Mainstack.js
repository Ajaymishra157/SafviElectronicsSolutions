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
import Deliveryreport from '../DeliveryReport/Deliveryreport';
import Paymentcollection from '../DeliveryReport/Paymentcollection';
import SalesReport from '../DeliveryReport/SalesReport';
import Salesreportdetail from '../DeliveryReport/Salesreportdetail';
import DeliveryManReport from '../DeliveryReport/DeliveryManReport';
import Customercategory from '../Managecategory/Customercategory';
import Customerwise_sales from '../DeliveryReport/Customerwise_sales';
import Productsales_customerwise from '../DeliveryReport/Productsales_customerwise';
import PaymentList from '../ManagePayments.js/PaymentList';
import Orderwisepayments from '../ManagePayments.js/Orderwisepayments';
import CustomerwiseOrders from '../Managecustomers/CustomerwiseOrders';
import Deliverymanreportdetails from '../DeliveryReport/Deliverymanreportdetails';
import Bags from '../Managecategory/Bags';
import Preforms from '../Managecategory/Preforms';
import LMTDReport from '../DeliveryReport/LMTDReport';
import Salesmanreport from '../DeliveryReport/Salesmanreport';
import SalesmanreportDetails from '../DeliveryReport/SalesmanreportDetails';
import Partyledger from '../DeliveryReport/Partyledger';
import Stockentrylist from '../ManageStockEntry/Stockentrylist';
import AddStockEntry from '../ManageStockEntry/AddStockEntry';
import StockReport from '../ManageStockEntry/StockReport';
import ManufacturedStock from '../ManageStockEntry/ManufacturedStock';
import SoldStock from '../ManageStockEntry/SoldStock';
import Purchaseentry from '../PurchaseEntry/Purchaseentry';
import Addpurchaseentry from '../PurchaseEntry/Addpurchaseentry';
import Purchasedetail from '../PurchaseEntry/Purchasedetail';
import MergeOrder from '../ManageOrders/MergeOrder';
import BDMTargetlist from '../ManageUsers/BDMTargetlist';
import BDMUsers from '../ManageUsers/BDMUsers';
import MyTargets from '../ManageUsers/MyTargets';
import UPIlist from '../Managecategory/UPIlist';
import DistributedCustomer from '../Distributor/DistributedCustomer';
import AddCustomertodistributor from '../Distributor/AddCustomertodistributor';
import AddCommission from '../Distributor/AddCommission';
import Schemeslist from '../ManageScheme/Schemeslist';
import AddScheme from '../ManageScheme/AddScheme';
import Lines from '../Managecategory/Lines';
import Calculatorlist from '../Calculator/Calculatorlist';
import AddCalculator from '../Calculator/AddCalculator';
import FestiveStaff from '../ManageFestiveStaff/FestiveStaff';
import FestiveStafflist from '../ManageFestiveStaff/FestiveStafflist';
import FestiveOrderlist from '../ManageFestiveOrders/FestiveOrderlist';
import FestiveOrderDetails from '../ManageFestiveOrders/FestiveOrderDetails';
import StaffAttendance from '../ManageFestiveStaff/StaffAttendance';
import StaffAttendancelist from '../ManageFestiveStaff/StaffAttendancelist';
import FestiveOrderPayment from '../ManageFestiveOrders/FestiveOrderPayment';
import FestiveStaffdetails from '../ManageFestiveStaff/FestiveStaffdetails';
import FestiveProductPrice from '../ManageFestiveOrders/FestiveProductPrice';
import FestiveCustomers from '../ManageFestiveOrders/FestiveCustomers';
import FestivePayementReport from '../ManageFestiveStaff/FestivePayementReport';
import MarginReport from '../DeliveryReport/MarginReport';
import MarginReportdetail from '../DeliveryReport/MarginReportdetail';
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
        <stack.Screen name="Deliveryreport" component={Deliveryreport} options={{ headerShown: false }} />
        <stack.Screen name="Paymentcollection" component={Paymentcollection} options={{ headerShown: false }} />
        <stack.Screen name="SalesReport" component={SalesReport} options={{ headerShown: false }} />
        <stack.Screen name="Salesreportdetail" component={Salesreportdetail} options={{ headerShown: false }} />
        <stack.Screen name="DeliveryManReport" component={DeliveryManReport} options={{ headerShown: false }} />
        <stack.Screen name="Customercategory" component={Customercategory} options={{ headerShown: false }} />
        <stack.Screen name="Customerwise_sales" component={Customerwise_sales} options={{ headerShown: false }} />
        <stack.Screen name="Productsales_customerwise" component={Productsales_customerwise} options={{ headerShown: false }} />
        <stack.Screen name="PaymentList" component={PaymentList} options={{ headerShown: false }} />
        <stack.Screen name="Orderwisepayments" component={Orderwisepayments} options={{ headerShown: false }} />
        <stack.Screen name="CustomerwiseOrders" component={CustomerwiseOrders} options={{ headerShown: false }} />
        <stack.Screen name="Deliverymanreportdetails" component={Deliverymanreportdetails} options={{ headerShown: false }} />
        <stack.Screen name="Bags" component={Bags} options={{ headerShown: false }} />
        <stack.Screen name="Preforms" component={Preforms} options={{ headerShown: false }} />
        <stack.Screen name="LMTDReport" component={LMTDReport} options={{ headerShown: false }} />
        <stack.Screen name="Salesmanreport" component={Salesmanreport} options={{ headerShown: false }} />
        <stack.Screen name="SalesmanreportDetails" component={SalesmanreportDetails} options={{ headerShown: false }} />
        <stack.Screen name="Partyledger" component={Partyledger} options={{ headerShown: false }} />
        <stack.Screen name="Stockentrylist" component={Stockentrylist} options={{ headerShown: false }} />
        <stack.Screen name="AddStockEntry" component={AddStockEntry} options={{ headerShown: false }} />
        <stack.Screen name="StockReport" component={StockReport} options={{ headerShown: false }} />
        <stack.Screen name="ManufacturedStock" component={ManufacturedStock} options={{ headerShown: false }} />
        <stack.Screen name="SoldStock" component={SoldStock} options={{ headerShown: false }} />
        <stack.Screen name="Purchaseentry" component={Purchaseentry} options={{ headerShown: false }} />
        <stack.Screen name="Addpurchaseentry" component={Addpurchaseentry} options={{ headerShown: false }} />
        <stack.Screen name="Purchasedetail" component={Purchasedetail} options={{ headerShown: false }} />
        <stack.Screen name="MergeOrder" component={MergeOrder} options={{ headerShown: false }} />
        <stack.Screen name="BDMTargetlist" component={BDMTargetlist} options={{ headerShown: false }} />
        <stack.Screen name="BDMUsers" component={BDMUsers} options={{ headerShown: false }} />
        <stack.Screen name="MyTargets" component={MyTargets} options={{ headerShown: false }} />
        <stack.Screen name="UPIlist" component={UPIlist} options={{ headerShown: false }} />
        <stack.Screen name="DistributedCustomer" component={DistributedCustomer} options={{ headerShown: false }} />
        <stack.Screen name="AddCustomertodistributor" component={AddCustomertodistributor} options={{ headerShown: false }} />
        <stack.Screen name="AddCommission" component={AddCommission} options={{ headerShown: false }} />

        <stack.Screen name="Schemeslist" component={Schemeslist} options={{ headerShown: false }} />
        <stack.Screen name="AddScheme" component={AddScheme} options={{ headerShown: false }} />

        <stack.Screen name="Lines" component={Lines} options={{ headerShown: false }} />

        <stack.Screen name="Calculatorlist" component={Calculatorlist} options={{ headerShown: false }} />
        <stack.Screen name="AddCalculator" component={AddCalculator} options={{ headerShown: false }} />

        <stack.Screen name="FestiveStaff" component={FestiveStaff} options={{ headerShown: false }} />
        <stack.Screen name="FestiveStafflist" component={FestiveStafflist} options={{ headerShown: false }} />
        <stack.Screen name="FestiveStaffdetails" component={FestiveStaffdetails} options={{ headerShown: false }} />
        <stack.Screen name="StaffAttendance" component={StaffAttendance} options={{ headerShown: false }} />
        <stack.Screen name="StaffAttendancelist" component={StaffAttendancelist} options={{ headerShown: false }} />

        <stack.Screen name="FestiveOrderlist" component={FestiveOrderlist} options={{ headerShown: false }} />
        <stack.Screen name="FestiveOrderDetails" component={FestiveOrderDetails} options={{ headerShown: false }} />
        <stack.Screen name="FestiveOrderPayment" component={FestiveOrderPayment} options={{ headerShown: false }} />

        <stack.Screen name="FestiveProductPrice" component={FestiveProductPrice} options={{ headerShown: false }} />
        <stack.Screen name="FestiveCustomers" component={FestiveCustomers} options={{ headerShown: false }} />
        <stack.Screen name="FestivePayementReport" component={FestivePayementReport} options={{ headerShown: false }} />

        <stack.Screen name="MarginReport" component={MarginReport} options={{ headerShown: false }} />
        <stack.Screen name="MarginReportdetail" component={MarginReportdetail} options={{ headerShown: false }} />

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





      </stack.Navigator>
    </NavigationContainer>
  )
}

export default Mainstack