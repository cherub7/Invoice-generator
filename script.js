/**************************************************************************************************
 * Methods and Variables used for editing items
 **************************************************************************************************/

// keeps track of id of the item being generated
var itemId = 0;

// wrapper function that adds a new item to the items division
function addItem() {
    itemId++;
    var html = '<div class="card purchase_item" style="padding: 25px; border-radius: 10px;">' + 
                '<input type="text" placeholder="Item name"/>' + 
                '<input type="number" placeholder="Item count"/>' + 
                '<input type="number" placeholder="Item cost"/>' +
                '<a class="btn-floating btn-medium waves-effect waves-light black" onclick="javascript:removeElement(\'item-' + 
                itemId + '\'); return false;"><i class="material-icons">remove</i>Remove</a></div>';
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
    // try to fill the form with localStorage
    fillData();

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

            reader.readAsDataURL(file);	
        } else {
            fileDisplayArea.innerHTML = "File not supported!"
        }
    });

    calendar = M.Datepicker.init(document.getElementById('invoice_date'), {});
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
function generatePDF(save_doc) {
    var doc = new jsPDF();

    generateHeader(doc);
    generateInvoice(doc);

    if (save_doc)
        doc.save('generated_invoice.pdf');
    else
        window.open(doc.output('bloburl'));
}

function generateHeader(doc) {
    var company_name = document.getElementById('company_name').value;
    var company_email = document.getElementById('company_email').value;
    var company_addr = document.getElementById('company_addr').value;
    var company_web = document.getElementById('company_web').value;
    var company_tel = document.getElementById('company_tel').value;

    var x_pos = 15;
    var y_pos = 10;

    if (document.getElementById('logo_display').innerHTML != '') {
        var imageData = document.getElementById('logo_display').firstChild;
        var imageText = document.getElementById('logo_display').innerHTML;
        var imageFormat = imageText.substring('<img src="data:image/'.length, imageText.search(";base64"));
        doc.addImage(imageData, imageFormat, x_pos, y_pos, 35, 35, 'company_logo', 'NONE', 0);
        x_pos += 40;
    }

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    
    y_pos += 7;
    doc.text(x_pos, y_pos, company_name);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    
    // add only entered details into pdf
    if (company_email) { 
        y_pos += 5;
        doc.text(x_pos, y_pos, company_email);
    }

    if (company_addr) { 
        y_pos += 5;
        doc.text(x_pos, y_pos, company_addr);
    }
    
    if (company_web) { 
        y_pos += 5;
        doc.text(x_pos, y_pos, company_web);
    }
    
    if (company_tel) { 
        y_pos += 5;
        doc.text(x_pos, y_pos, company_tel);
    }

    // line to mark the end of header
    y_pos = 47;
    doc.line(10, y_pos, 200, 45);
}

function generateInvoice(doc) {
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');

    doc.text(85, 55, 'BILL RECEIPT')
    
    client_name = document.getElementById('client_name').value;
    client_tel = document.getElementById('client_tel').value;
    client_place = document.getElementById('client_place').value;
    invoice_date = document.getElementById('invoice_date').value;
    invoice_msg = document.getElementById('invoice_msg').value;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');

    var y_pos = 59;

    if (client_name) {
        y_pos += 5;
        doc.text(15, y_pos, 'To    : ' + client_name);
    }

    if (invoice_date) {
        y_pos += 5;
        doc.text(15, y_pos, 'Date : ' + invoice_date);
    }

    if (client_place) {
        y_pos += 5;
        doc.text(15, y_pos, 'Place: ' + client_place);
    }

    doc.text(15, 82, '     ' + invoice_msg);

    generatePurchaseList(doc);
}

function generatePurchaseList(doc) {
    var headers = [ "Name", "Qty", "Cost" ];

    var items_div = document.getElementById('items');
    var items = [];
    var total_cost = 0;

    for (var i = 0; i < items_div.children.length; i++) {
        var item = new Object();

        item.Name = items_div.children[i].children[0].children[0].value;
        item.Qty = items_div.children[i].children[0].children[1].value;
        item.Cost = items_div.children[i].children[0].children[2].value;

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

    doc.table(55, 100, items, headers, config);
}


/**************************************************************************************************
 * Variables and Methods to handle localStorage
 **************************************************************************************************/

var store = window.localStorage;
var keys = [ 'company_name', 'company_email', 'company_addr', 'company_web', 'company_tel' ];

// save data from input fields onto local storage
function saveData() {
    for (var i = 0; i < 5; i++) {
        store.setItem(keys[i], document.getElementById(keys[i]).value);
    }
    store.setItem('logo_display', document.getElementById('logo_display').innerHTML);
}

// fill the data stored onto the form
function fillData() {
    for (var i = 0; i < 5; i++) {
        document.getElementById(keys[i]).value = store.getItem(keys[i]);
    }
    document.getElementById('logo_display').innerHTML = store.getItem('logo_display');
    M.updateTextFields();
}

// completely clears the local storage
function clearData() {
    store.clear();
    fillData();
}
