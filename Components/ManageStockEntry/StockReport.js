import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Subheader from '../Commoncomponent/Subheader'
import Constant from '../Commoncomponent/Constant';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';

const StockReport = ({ navigation }) => {
  const [stockdata, setStockdata] = useState([]);
  const [totalamount, setTotalAmount] = useState(null);
  const [stockin, setStockin] = useState(null);
  const [stockout, setStockOut] = useState(null);
  const [availablestock, setAvailablestock] = useState(null);
  const [mainloading, setMainloading] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const formatDate = (date) => {
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
  const today = new Date();

  const formatDateToDatabase = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format to yyyy-mm-dd
  };



  // PDF Download Function
  // const downloadStockReportPDF = async () => {
  //   setPdfLoading(true);

  //   try {
  //     const htmlContent = `
  //       <html>
  //         <head>
  //           <meta charset="UTF-8">
  //           <style>
  //             body {
  //               font-family: 'Inter', Arial, sans-serif;
  //               font-size: 12px;
  //               color: #173161;
  //               padding: 20px;
  //               background-color: white;
  //             }
  //             .header {
  //               text-align: center;
  //               margin-bottom: 20px;
  //               border-bottom: 2px solid #173161;
  //               padding-bottom: 10px;
  //             }
  //             .header h1 {
  //               font-size: 18px;
  //               font-weight: bold;
  //               color: #173161;
  //               margin: 0;
  //             }
  //             .date-range {
  //               text-align: center;
  //               font-size: 14px;
  //               margin-bottom: 15px;
  //               font-weight: bold;
  //             }
  //             table {
  //               width: 100%;
  //               border-collapse: collapse;
  //               margin-top: 10px;
  //               border: 1px solid #173161;
  //             }
  //             th, td {
  //               border: 1px solid #173161;
  //               padding: 6px;
  //               text-align: center;
  //               font-size: 10px;
  //             }
  //             th {
  //               background-color: #f0f0f0;
  //               font-weight: bold;
  //             }
  //             .subcategory-header {
  //               background-color: #e8e8e8;
  //               font-weight: bold;
  //               text-align: left;
  //               padding: 4px 8px;
  //               border-bottom: 1px solid #173161;
  //               text-transform: uppercase;
  //             }
  //             .product-row {
  //               border-bottom: 1px solid #173161;
  //             }
  //             .total-row {
  //               background-color: #f8f8f8;
  //               font-weight: bold;
  //               border-top: 2px solid #173161;
  //             }
  //             .product-name {
  //               text-align: left;
  //               padding-left: 5px;
  //             }
  //             .footer {
  //               margin-top: 20px;
  //               text-align: center;
  //               font-size: 10px;
  //               color: #666;
  //             }
  //           </style>
  //         </head>
  //         <body>
  //           <div class="header">
  //             <h1>STOCK REPORT</h1>
  //           </div>

  //           <div class="date-range">
  //             Period: ${formatDate(startDate)} to ${formatDate(endDate)}
  //           </div>

  //           <table>
  //             <thead>
  //               <tr>
  //                 <th style="width: 30%">Product Name</th>
  //                 <th style="width: 18%">Stock In</th>
  //                 <th style="width: 18%">Stock Out</th>
  //                 <th style="width: 17%">Available</th>
  //                 <th style="width: 17%">Amount</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               ${stockdata.map((subcat, index) => `
  //                 <tr>
  //                   <td colspan="5" class="subcategory-header">${subcat.subcategory_name}</td>
  //                 </tr>
  //                 ${subcat.products.map((product, productindex) => `
  //                   <tr class="product-row">
  //                     <td class="product-name">${product.product_name}</td>
  //                     <td>${product.stock_in}</td>
  //                     <td>${product.stock_out}</td>
  //                     <td>${product.available_stock}</td>
  //                     <td>${product.amount}</td>
  //                   </tr>
  //                 `).join('')}
  //               `).join('')}

  //               <!-- Total Row -->
  //               <tr class="total-row">
  //                 <td><strong>Total</strong></td>
  //                 <td><strong>${stockin}</strong></td>
  //                 <td><strong>${stockout}</strong></td>
  //                 <td><strong>${availablestock}</strong></td>
  //                 <td><strong>${totalamount}</strong></td>
  //               </tr>
  //             </tbody>
  //           </table>

  //           <div class="footer">
  //             <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  //             <p>Total Products: ${stockdata.reduce((total, subcat) => total + subcat.products.length, 0)}</p>
  //             <p>Total Subcategories: ${stockdata.length}</p>
  //           </div>
  //         </body>
  //       </html>
  //     `;

  //     // Generate PDF from HTML content
  //     const options = {
  //       html: htmlContent,
  //       fileName: `Stock_Report_${formatDateToDatabase(startDate)}_to_${formatDateToDatabase(endDate)}`,
  //       directory: Platform.OS === 'android' ? RNFS.CachesDirectoryPath : RNFS.DocumentDirectoryPath,
  //     };

  //     const file = await RNHTMLtoPDF.convert(options);
  //     console.log('PDF file created:', file.filePath);

  //     // Define destination path
  //     let destinationPath;
  //     if (Platform.OS === 'android') {
  //       destinationPath = `${RNFS.DownloadDirectoryPath}/Stock_Report_${formatDateToDatabase(startDate)}_to_${formatDateToDatabase(endDate)}.pdf`;
  //     } else {
  //       destinationPath = `${RNFS.DocumentDirectoryPath}/Stock_Report_${formatDateToDatabase(startDate)}_to_${formatDateToDatabase(endDate)}.pdf`;
  //     }

  //     // Move file to destination
  //     await RNFS.moveFile(file.filePath, destinationPath);
  //     console.log('PDF saved to:', destinationPath);

  //     // Scan file for Android
  //     if (Platform.OS === 'android') {
  //       await RNFS.scanFile(destinationPath);
  //     }

  //     Alert.alert(
  //       'PDF Downloaded Successfully',
  //       `Stock report has been saved to your ${Platform.OS === 'android' ? 'Downloads' : 'Documents'} folder.`,
  //       [{ text: 'OK' }]
  //     );

  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     Alert.alert(
  //       'Error',
  //       'Failed to generate PDF. Please try again.',
  //       [{ text: 'OK' }]
  //     );
  //   } finally {
  //     setPdfLoading(false);
  //   }
  // };
  const fetchstockdata = async () => {
    setMainloading(true);
    const formattedstartDate = formatDateToDatabase(startDate);
    const formattedendDate = formatDateToDatabase(endDate);
    const url = `${Constant.URL}${Constant.OtherURL.stock_report}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date: formattedstartDate,
        end_date: formattedendDate,
      }),
    });
    const result = await response.json();
    if (result.code == "200") {
      setStockdata(result.payload);
      let total = 0;
      let stockin = 0;
      let stockout = 0;
      available = 0;
      result.payload.forEach(subcat => {
        subcat.products.forEach(product => {
          total += parseFloat(product.amount) || 0;
          stockin += parseFloat(product.stock_in) || 0
          stockout += parseFloat(product.stock_out) || 0
          available += parseFloat(product.available_stock) || 0
        });
      });
      setTotalAmount(total);
      setStockin(stockin);
      setStockOut(stockout);
      setAvailablestock(available);
    } else {
      setStockdata([]);
      console.log('error while fetching data');
    }
    setMainloading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchstockdata();
    }, [startDate, endDate])
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
      <Subheader headername="Stock Report" />
      {/* <TouchableOpacity
        onPress={downloadStockReportPDF}
        disabled={pdfLoading || mainloading || stockdata.length === 0}
        style={{
          backgroundColor: '#173161',
          padding: 12,
          margin: 10,
          borderRadius: 8,
          alignItems: 'center',
          opacity: (pdfLoading || mainloading || stockdata.length === 0) ? 0.6 : 1,
        }}
      >
        {pdfLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={{ color: 'white', fontFamily: 'Inter-Bold', fontSize: 16 }}>
            📥 Download PDF Report
          </Text>
        )}
      </TouchableOpacity> */}
      <View style={{ flex: 1 }}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 5, }}>
          {/* Start Date Button */}
          <TouchableOpacity onPress={showStartDatePicker} style={{ width: '48%', borderWidth: 0.5, borderColor: 'gray', marginVertical: 10, borderRadius: 10, padding: 15 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayStartDate}</Text>
          </TouchableOpacity>

          {/* End Date Button */}
          <TouchableOpacity onPress={showEndDatePicker} style={{ width: '48%', borderWidth: 0.5, borderColor: 'gray', marginVertical: 10, borderRadius: 10, padding: 15 }}>
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#173161' }}>{displayEndDate}</Text>
          </TouchableOpacity>

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
        </View>

        <ScrollView keyboardShouldPersistTaps='handled'>
          <View style={{ borderWidth: 1, borderColor: '#173161', margin: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#173161' }}>
              <Text style={{ width: '30%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', paddingVertical: 2, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#173161' }}></Text>
              <Text style={{ width: '18%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', paddingVertical: 2, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#173161' }}>Stock</Text>
              <Text style={{ width: '18%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', paddingVertical: 2, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#173161' }}>Out</Text>
              <Text style={{ width: '17%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', paddingVertical: 2, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#173161' }}>Available</Text>
              <Text style={{ width: '17%', fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', paddingVertical: 2, textAlign: 'center', }}>Amount</Text>
            </View>

            {stockdata.map((subcat, index) => (
              <View key={index}>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 12, color: '#173161', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#173161', paddingHorizontal: 5, paddingVertical: 3 }}>{subcat.subcategory_name}</Text>
                {subcat.products.map((product, productindex) => (
                  <View key={productindex} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#173161' }}>
                    <Text style={{ width: '30%', fontFamily: 'Inter-Regular', fontSize: 9, color: '#173161', paddingVertical: 2, paddingLeft: 3, borderRightWidth: 1, borderRightColor: '#173161' }}>{product.product_name}</Text>

                    <View style={{ width: '18%', flexDirection: 'row', borderRightWidth: 1, borderRightColor: '#173161' }}>
                      <Text style={{ width: '70%', fontFamily: 'Inter-Regular', fontSize: 9, color: '#173161', textAlign: 'center', textAlignVertical: 'center', }}>{product.stock_in}</Text>
                      {product.stock_in != 0 &&
                        <TouchableOpacity onPress={() => navigation.navigate('ManufacturedStock', { product_id: product.product_id, productname: product.product_name, stock_in: product.stock_in, startDate: startDate, endDate: endDate })} style={{ alignItems: 'center', justifyContent: 'center', padding: 3 }}>
                          <Image source={require('../../assets/info.png')} style={{ height: 15, width: 15 }} />
                        </TouchableOpacity>
                      }
                    </View>

                    <View style={{ width: '18%', flexDirection: 'row', borderRightWidth: 1, borderRightColor: '#173161' }}>
                      <Text style={{ width: '70%', fontFamily: 'Inter-Regular', fontSize: 9, color: '#173161', textAlign: 'center', textAlignVertical: 'center', }}>{product.stock_out}</Text>
                      {product.stock_out != 0 &&
                        <TouchableOpacity onPress={() => navigation.navigate('SoldStock', { product_id: product.product_id, productname: product.product_name, stock_out: product.stock_out, startDate: startDate, endDate: endDate })} style={{ alignItems: 'center', justifyContent: 'center', padding: 3 }}>
                          <Image source={require('../../assets/info.png')} style={{ height: 15, width: 15 }} />
                        </TouchableOpacity>
                      }
                    </View>

                    <Text style={{ width: '17%', fontFamily: 'Inter-Regular', fontSize: 9, color: '#173161', paddingVertical: 2, textAlign: 'center', textAlignVertical: 'center', borderRightWidth: 1, borderRightColor: '#173161' }}>{product.available_stock}</Text>
                    <Text style={{ width: '17%', fontFamily: 'Inter-Regular', fontSize: 9, color: '#173161', paddingVertical: 2, textAlign: 'center', textAlignVertical: 'center', }}>{product.amount}</Text>
                  </View>
                ))}
              </View>
            ))}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: '30%', borderRightWidth: 1, borderColor: '#173161', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter-Bold', color: '#173161', paddingVertical: 5, }}>Total</Text>
              </View>

              <View style={{ width: '18%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center' }}>
                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase' }}>{stockin}</Text>
              </View>

              <View style={{ width: '18%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center' }}>
                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase' }}>{stockout}</Text>
              </View>

              <View style={{ width: '17%', justifyContent: 'center', borderRightWidth: 1, borderColor: '#173161', alignItems: 'center' }}>
                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase' }}>{availablestock}</Text>
              </View>

              <View style={{ width: '17%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#173161', fontFamily: 'Inter-SemiBold', paddingVertical: 5, fontSize: 10, textTransform: 'uppercase' }}>{totalamount}</Text>
              </View>

            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

export default StockReport