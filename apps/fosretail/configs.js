/* eslint-disable no-unused-vars */

        var endpoint,key,authSecret;
        var appConfig={
          server_url:"https://api.fostech.vn",
          server_url_report:"https://api.fostech.vn",
          print_service_url:"http://localhost:8989/web-print",
          id_app:"",
          group_id:"",
          public_token:"",
          app_title:"FOS RETAIL",
          app_name:"FOS RETAIL",
          app_name_en:"FOS RETAIL",
          sologan_en:"",
          sologan:"",
          app_description:"",
          app_address:"",
          app_phone:"",
          app_email:"info@fostech.vn",
          primaryColor:"#845B7D",
          secondaryColor:"#5B8462",
          mainColor:"#845B7D",
          titleColor:"#845B7D",
          iconColor:"#845B7D",
          progressColor:"#845B7D",
          mainTextColor:"#fff",
          fragBrightenFirst:1,
          printPageWidth:"302",
          GOOGLE_MAPS_APIKEY:"",
          GOOGLE_RECAPTCHA_SITE_KEY:"6Lf25qEUAAAAAFHwh_XZw-YY6HXTdyv2xEp9AHbt",
          showChatIcon: false,
          showNotifyIcon:false,
          menu:[
            {"code":"dashboard","title":"Bảng điều khiển","path":"/dashboard","group":"Home"},
            {"code":"banhang","title":"Bán hàng","path":"/banhang","group":"Bán hàng","horizontal":true},
            {"code":"bepmonitor","title":"Màn hình bếp","path":"/kitchen-monitor","group":"Bán hàng","horizontal":true},
            {"code":"bartendermonitor","title":"Màn hình bartender","path":"/bartender-monitor","group":"Bán hàng","horizontal":true},
            {"code":"giaoca","title":"Giao ca","path":"/list/giaoca","group":"Bán hàng","horizontal":true},

            {"code":"dkhoc","title":"Đăng ký học","path":"/list/dkhoc","group":"Đào tạo","horizontal":true},
            {"code":"khoahoc","title":"Danh sách khoá học","path":"/list/khoahoc","group":"Đào tạo","horizontal":true},
            
            
            {"code":"pbl","title":"Bảng kê phiếu bán hàng","path":"/voucher/pbl","group":"Báo cáo","horizontal":true},
            {"code":"dtbanletheongay","title":"Doanh thu bán lẻ theo ngày","path":"/report/dtbanletheongay","group":"Báo cáo","horizontal":true},
            {"code":"dtbanletheothang","title":"Doanh thu bán lẻ theo tháng","path":"/report/dtbanletheothang","group":"Báo cáo","horizontal":true},
            {"code":"dtbanletheoquy","title":"Doanh thu bán lẻ theo quý","path":"/report/dtbanletheoquy","group":"Báo cáo","horizontal":true},
            {"code":"dtbanletheonam","title":"Doanh thu bán lẻ theo năm","path":"/report/dtbanletheonam","group":"Báo cáo","horizontal":true},
            {"code":"dtbanletheovt","title":"Doanh thu bán lẻ theo sản phẩm","path":"/report/dtbanletheovt","group":"Báo cáo","horizontal":true},
            {"code":"dtbanletheokho","title":"Doanh thu bán lẻ theo cửa hàng","path":"/report/dtbanletheokho","group":"Báo cáo","horizontal":true},
            {"code":"dtbanletheokh","title":"Doanh thu bán lẻ theo khách hàng","path":"/report/dtbanletheokh","group":"Báo cáo","horizontal":true},

            {"code":"evoucher","title":"Voucher chiết khấu","path":"/list/evoucher","group":"Cài đặt","horizontal":true},
            {"code":"evoucher","title":"Chính sách chiết khấu","path":"/list/dmchietkhau","group":"Cài đặt","horizontal":true},
            {"code":"dmgiaban","title":"Chính sách giá bán","path":"/list/dmgiaban","group":"Cài đặt","horizontal":true},
            

            {"code":"dmkho","title":"Khai báo cửa hàng","path":"/list/dmkho","group":"Cài đặt","horizontal":true},
            {"code":"dmnvt","title":"Khai báo sản phẩm","path":"/list/dmnvt","group":"Cài đặt","horizontal":true},
            {"code":"customer","title":"Khai báo khách hàng","path":"/list/customer","group":"Cài đặt","horizontal":true},
            {"code":"note","title":"Khai báo ghi chú","path":"/list/note?id_link=PBL","group":"Cài đặt","horizontal":true},
            {"code":"ptthanhtoan","title":"Phương thức thanh toán","path":"/list/ptthanhtoan","group":"Cài đặt","horizontal":true},
            {
              "code":"file",
              "title":"Quản lý file",
              "path":"/list/file",
              "group":"Cài đặt",
              "visible":false
            },
            {
              "code":"usergroup",
              "title":"Quản lý nhóm người dùng",
              "path":"/list/usergroup",
              "group":"Cài đặt","horizontal":true
            },
            {
              "code":"participant",
              "title":"Quản lý người dùng",
              "path":"/list/participant",
              "group":"Cài đặt",
              "visible":false,"horizontal":true
            },
            {
              "code":"appinfo",
              "title":"Thông tin về công ty",
              "rights":["view"],
              "path":"/system/appinfo",
              "group":"Cài đặt"
            }
          ]
        }
      