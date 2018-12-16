/**************************************************************************************************
 * Methods and Variables used for editing items
 **************************************************************************************************/

// keeps track of id of the item being generated
var itemId = 0;

// flag to check whether user has uploaded company logo or not
var hasLogo = false;

// wrapper function that adds a new item to the items division
function addItem() {
    itemId++;
    var html = '<input type="text" placeholder="Item name" class="invoice_element"/>' + 
                '<input type="number" placeholder="Item count" class="invoice_element"/>' + 
                '<input type="number" placeholder="Item cost" class="invoice_element"/>' +
                '<button class="btn btn-danger" onclick="javascript:removeElement(\'item-' + 
                itemId + '\'); return false;">Remove</button>';
    addElement('items', 'p', 'item-' + itemId, html);
}

// adds a new item to the items divison
function addElement(parentId, elementTag, elementId, html) {
    var p = document.getElementById(parentId);
    var newElement = document.createElement(elementTag);
    newElement.setAttribute('id', elementId);
    newElement.innerHTML = html;
    p.appendChild(newElement);
}

// removes an item from the items division
function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}


/**************************************************************************************************
 * Methods to handle the company logo upload
 **************************************************************************************************/

window.onload = function() {
    loadDataFormCookie();

    var fileInput = document.getElementById('company_logo');
    var fileDisplayArea = document.getElementById('logo_display');

    // function to check when an input file is loaded
    fileInput.addEventListener('change', function(e) {
        var file = fileInput.files[0];
        var imageType = /image.*/;

        if (file.type.match(imageType)) {
            var reader = new FileReader();

            reader.onload = function(e) {
                fileDisplayArea.innerHTML = "";

                var img = new Image();
                img.src = reader.result;

                fileDisplayArea.appendChild(img);
            }

            hasLogo = true;
            reader.readAsDataURL(file);	
        } else {
            hasLogo = false;
            fileDisplayArea.innerHTML = "File not supported!"
        }
    });
}

// function to trigger the invisible file input element
function uploadImage() {
    var image_input = document.getElementById('company_logo');
    image_input.click();
}


/**************************************************************************************************
 * Methods to generate the invoice pdf
 **************************************************************************************************/

 // driver function for creating the invoice pdf
function generatePDF() {
    var doc = new jsPDF();

    generateHeader(doc);
    generateInvoice(doc);

    // check whether new cookie needs to be generated
    if (document.getElementById('set_cookie').checked) {
        createCookie();
        updateSetCookieInfo();
        document.getElementById('set_cookie').checked = false;
    }

    doc.save('generated_invoice.pdf');
}

function generateHeader(doc) {
    var company_name = document.getElementById('company_name').value;
    var company_email = document.getElementById('company_email').value;
    var company_addr = document.getElementById('company_addr').value;
    var company_web = document.getElementById('company_web').value;
    var company_tel = document.getElementById('company_tel').value;

    var x = 15;
    if (hasLogo) {
        var imageData = document.getElementById('logo_display').firstChild;
        doc.addImage(imageData, 'jpg', x, 10, 35, 35, 'company_logo', 'NONE', 0);
        x += 45
    }

    doc.setFontSize(15);
    doc.setFontStyle('bold');
    
    doc.text(x, 17, company_name);

    doc.setFontSize(13);
    doc.setFontStyle('none');
    
    doc.text(x, 22, company_email);
    doc.text(x, 27, company_addr);
    doc.text(x, 32, company_web);
    doc.text(x, 37, company_tel);

    doc.line(10, 47, 200, 45);
}

function generateInvoice(doc) {
    doc.setFontSize(15);
    doc.setFontStyle('bold');

    doc.text(85, 55, 'BILL RECEIPT')
    
    client_name = document.getElementById('client_name').value;
    client_tel = document.getElementById('client_tel').value;
    invoice_date = document.getElementById('invoice_date').value;
    invoice_msg = document.getElementById('invoice_msg').value;

    doc.setFontSize(13);
    doc.setFontStyle('none');

    doc.text(15, 64, 'To  : ' + client_name);
    doc.text(15, 69, 'Date: ' + invoice_date);

    doc.text(15, 77, '     ' + invoice_msg)

    generatePurchaseList(doc);
}

function generatePurchaseList(doc) {
    var headers = [ "Name", "Qty", "Cost" ];

    var items_div = document.getElementById('items');
    var items = [];
    var total_cost = 0;

    for (var i = 0; i < items_div.children.length; i++) {
        var item = new Object();

        item.Name = items_div.children[i].children[0].value;
        item.Qty = items_div.children[i].children[1].value;
        item.Cost = items_div.children[i].children[2].value;

        total_cost += item.Qty * item.Cost;
        items.push(item);
    }

    if (items.length == 0) {
        return;
    }

    items.push({
        'Name': 'Total: ',
        'Qty': '',
        'Cost': total_cost

    })

    var config = {
        'autoSize': true,
        'margins': {
            'left': 20,
            'top': 10,
            'bottom': 10,
            'width': 40
        }
    }

    doc.table(55, 90, items, headers, config);
}


/**************************************************************************************************
 * Methods to handle cookie
 **************************************************************************************************/

function createCookie() {
    var cookie_names = [ 'company_name', 'company_email', 'company_addr', 'company_web', 'company_tel' ];

    for (var i = 0; i < 5; i++) {
        document.cookie = (cookie_names[i] + "=" + document.getElementById(cookie_names[i]).value + "; ");
    }

    // cookie expiry is set to 30 days
    var date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = "expires=" + date.toGMTString() + ";";

    document.cookie = "path=/;"
}

function getCookie(cookie_name) {
    var name = cookie_name + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookies = decodedCookie.split(';');

    for(var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];

      while (cookie.charAt(0) == ' ') {
        cookie = cookie.substring(1);
      }

      if (cookie.indexOf(name) == 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }

    return "";
}

function updateSetCookieInfo() {
    if (document.cookie != "") {
        document.getElementById('set_cookie_message').innerText = 'Allow cookies to store your company details.(cookie already exists)';
        document.getElementById('set_cookie_invalid_message').innerText = 'Select this option to overwrite existing cookie';
        document.getElementById('set_cookie_valid_message').innerText = 'Details are stored everytime PDF is generated.(overwrite existing cookie)';
    }
}

function loadDataFormCookie() {
    updateSetCookieInfo();
    
    var cookie_names = [ 'company_name', 'company_email', 'company_addr', 'company_web', 'company_tel' ];

    for (var i = 0; i < 5; i++) {
        document.getElementById(cookie_names[i]).value = getCookie(cookie_names[i]);
    }
}
