$(document).ready(function () {
    setEvent();
    loadData(1);
})

var formMode = null;
var customerIdSelected =  null;
/** ---------------------------
 * Gán sự kiện cho các Element
 * CreatedBy: NVMANH (22/03/2021)
 */
function setEvent() {

    $(document).on('click', '.dialog-close-button', function () {
        $('#dlgCustomerDetail').addClass('dialog-hide');
    })

    $(document).on('click', '.btn-delete', function () {
        // Lấy khóa chính của bản ghi người dùng vừa chọn:
        var customerId = $('#tblListCustomer tbody tr.bg-selected-row').data('recordId');
       
        // Hiển thị cảnh báo cho người dùng:
        var result = confirm("Bạn có chắc chắn muốn xóa Khách hàng khỏi hệ thống?");
        if(result){
            $.ajax({
                method: "DELETE",
                url: "http://api.manhnv.net/api/customers/"+ customerId
            }).done(function(){
                alert("Xóa thành công!");
                loadData();
            }).fail(function(res){
                alert("Không thể xóa khách hàng này, vui lòng kiểm tra lại..");
            })
        }
        // Thực hiện xóa nếu khách hàng xác nhận (Nhấn đồng ý xóa):

    })

    $(document).on('click', '#tblListCustomer tbody tr', function () {
        // Xóa tất cả các dòng đã có bg xác định trạng thái dòng được chọn
        $(this).siblings('.bg-selected-row').removeClass('bg-selected-row');
        // thay bg cho dòng vừa chọn:
        $(this).addClass('bg-selected-row');
    })

    // Nhấn đúp chuột vào dòng dữ liệu trên table thì hiển thị Form thông tin chi tiết:
    $('#tblListCustomer').on('dblclick','tbody tr',rowOnDblClick);
    $('#btnAdd').click(function () {
        formMode = 1;
        $('.dialog input').val(null);
        $('.dialog select').val(null);
        $('#dlgCustomerDetail').removeClass('dialog-hide');
    })
    $('#btnSave').click(btnSaveOnClick);
}

/** -------------------------------------
 * Nhấn đúp chuột vào bản ghi trên table
 * CreatedBy: NVMANH (24/03/2021)
 */
function rowOnDblClick(){
    formMode = 2;
    // Lấy Id của bản ghi:
    var customerId = $(this).data('recordId');
    customerIdSelected = customerId;
    // Lấy thông tin chi tiết khách hàng:
    $.ajax({
        method: "GET",
        url: "http://api.manhnv.net/api/customers/"+ customerId
    }).done(function(res){
        // Bindding dữ liệu lên form chi tiết:
        var customer = res;
        $('#txtCustomerCode').val(customer.CustomerCode);
        $('#txtFullName').val(customer.FullName);
        $('#cbCustomerGroup').val(customer.CustomerGroupId);
        $('#cbGender').val(customer.Gender);
        $('#dtDateOfBirth').val(customer.DateOfBirth);
        $('#txtPhoneNumber').val(customer.PhoneNumber);
        $('#txtEmail').val(customer.Email);
    }).fail(function(res){
        alert(res.responseText);
    })
    // Hiển thị form chi tiết:
    $('#dlgCustomerDetail').removeClass('dialog-hide');
}


/** ---------------------------
 * Sự kiện khi nhấn button Cất
 * CreatedBy: NVMANH (22/03/2021)
 */
function btnSaveOnClick(){
    // Thu thập dữ liệu ở các input (input, select...)
    var customerCode = $('#txtCustomerCode').val();
    var fullName = $('#txtFullName').val();
    var customerGroupId = $('#cbCustomerGroup').val();
    var gender = $('#cbGender').val();
    var dob = $('#dtDateOfBirth').val();
    var phone = $('#txtPhoneNumber').val();
    var email = $('#txtEmail').val();
    // Build thành object:
    var customer = {
        "CustomerCode": customerCode,
        "FullName": fullName,
        "Gender": gender,
        "DateOfBirth": dob,
        "Email": email,
        "PhoneNumber": phone
      }
    var method =  "POST";
    var url = "http://api.manhnv.net/api/customers";
    if(formMode == 2){
        customer.CustomerId = customerIdSelected;
        method =  "PUT";
        url = "http://api.manhnv.net/api/customers/" + customerIdSelected;
    }
    debugger;
    // Gọi service POST để thực hiện cất dữ liệu:
    $.ajax({
        method: method,
        url: url,
        data: JSON.stringify(customer),
        contentType:'application/json'
    }).done(function(res){
        if(formMode == 1){
            alert('Thêm mới thành công!');
        }else{
            alert('Sửa thành công!');
        }
        
        $('#dlgCustomerDetail').addClass('dialog-hide');
        // load lại dữ liệu
        loadData();

    }).fail(function(res){
        console.log(res);
        alert(res.responseText);
    })
}

/**
 * Thực hiện binding dữ liệu lên form
 * @param {object} customer
 * CreatedBy NVMANH (22/03/2021) 
 */
function bindingDetailData(customer){
    
}
/**
 * Load dữ liệu khách hàng
 * */
function loadData() {
    $('#tblListCustomer tbody').empty();
    // lấy dữ liệu từ Api về;
    var data = getData();
    console.table(data);
    buildDataTableHTML(data);
}

/**
 * Hàm thực hiện lấy dữ liệu
 * */
function getData() {
    var customers = null;
    $.ajax({
        method: "GET",
        url: "http://api.manhnv.net/api/customers",
        data: null,
        async: false,
        contentType: "application/json"
    }).done(function (response) {
        customers = response;
    }).fail(function (response) {
        alert("Không thể lấy dữ liệu từ Api");
    })
    return customers;
}

/**
 * Thực hiện build bảng dữ liệu tương ứng với dữ liệu lấy từ Api
 * @param {Array} data mảng dữ liệu
 * CreatedBy: NVMANH (17/03/2021)
 */
function buildDataTableHTML(data) {
    //$('table#tblListCustomer tbody').html('');
    $.each(data, function (index, customer) {
        var dateOfBirth = customer.DateOfBirth;
        debugger;
        var dateFormat = formatDateDDMMYYYY(dateOfBirth);
        // Xử lý dữ liệu ngày tháng (Hiển thị dạng ngày/tháng/năm - nếu có):
        var debitAmout = Math.floor(Math.random() * 100000000);
        var moneyFormat = formatMoney(debitAmout);
        var trHTML = $(`<tr>
                        <td>${customer.CustomerCode}</td>
                        <td>${customer.FullName}</td>
                        <td>${customer.GenderName}</td>
                        <td>${dateFormat}</td>
                        <td>${customer.CustomerGroupName}</td>
                        <td>${customer.PhoneNumber}</td>
                        <td>${customer.Email}</td>
                        <td class="text-align-right">${moneyFormat}</td>
                        <td class="text-align-center"><input type="checkbox" checked/></td>
                    </tr>`);
                    debugger;
        trHTML.data('recordId', customer.CustomerId);
        trHTML.data('record', customer);
        $('table#tblListCustomer tbody').append(trHTML);
    })
}


/**
 * Xử lý khi truyền ngày tháng vào sẽ trả về chuỗi string có dạng ngày/tháng/năm
 * @param {Date} date mảng dữ liệu
 * CreatedBy: NVMANH (17/03/2021)
 */
function formatDateDDMMYYYY(date) {
    if (!date) {
        return "";
    }
    var newDate = new Date(date);
    var dateString = newDate.getDate();
    var monthString = newDate.getMonth() + 1;
    var year = newDate.getFullYear();
    return `${dateString}/${monthString}/${year}`;
}


/**
 * Xử lý hiển thị tiền tệ - cách 1
 * @param {Number} money Số tiền dạng decimal
 * CreatedBy: NVMANH (17/03/2021)
 */
function formatMoney(money) {
    var moneyFormat = money.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " VND";;
    return moneyFormat;
}

/**
 * Xử lý hiển thị tiền tệ - cách 2
 * @param {Number} money Số tiền dạng decimal
 * CreatedBy: NVMANH (17/03/2021)
 */
function formatMoney(money) {
    const formatter = new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: 0
    })
    if (money) {
        return formatter.format(money) // "$1,000.00"
    }
    return "";
}
