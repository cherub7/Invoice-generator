window.onload = function() {
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

                img.id = "logo_image";

                document.getElementById('logo_icon').innerHTML = '';
                fileDisplayArea.appendChild(img);
            }

            reader.readAsDataURL(file);	
        } else {
            alert("File not supported!");
        }
    });

    fillDetails();

    calendar = M.Datepicker.init(document.getElementById('invoice_date'), {});
}

function fillDetails() {
    // get id of the doc from url
    let doc_id = document.location.search.replace(/^.*?\=/,'');

    let docRef = db.collection("data").doc(doc_id);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            let data = JSON.parse(doc.data().data);
            fillInvoice(data);
        } else {
            alert("Error loading invoice data.");
        }
    }).catch(function(error) {
        alert("Error fetching invoice data.", error);
    });
}

function previewInvoice() {
    let data = getInvoiceData();
    generatePDF(data, false, false);
}

function saveDetails() {
    var user_email = userEmail;
    // get id of the doc from url
    let doc_id = document.location.search.replace(/^.*?\=/,'');

    var docRef = db.collection("data").doc(doc_id);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            var data = getInvoiceData();

            db.collection('data').doc(doc_id).set({
                data: JSON.stringify(data),
                mail: user_email,
                time: firebase.firestore.Timestamp.fromDate(new Date())
            })
            .then(function(docRef) {
                alert("Successfully updated invoice data.");
                window.location = './history.html';
            })
            .catch(function(error) {
                alert("Error while updating invoice data.");
            });

        } else {
            alert("Error fetching invoice data.");
        }
    }).catch(function(error) {
        alert("No such invoice exists!", error);
    });
}

/**************************************************************************************************
 * Methods and Variables used for editing items
 **************************************************************************************************/

// keeps track of id of the item being generated
var itemId = 0;

// wrapper function that adds a new item to the items division
function addItem() {
    itemId++;
    var html = '<div class="row">' +
                '<div class="col s3"><input type="text" placeholder="Item name"/></div>' + 
                '<div class="col s2"><input type="number" placeholder="Item count"/></div>' + 
                '<div class="col s2"><input type="number" placeholder="Item cost"/></div>' +
                '<div class="col s2"><input type="number" min="0" max="100" placeholder="Tax %"/></div>' +
                '<div class="col s2"><input type="number" min="0" max="100" placeholder="Discount %"/></div>' +
                '<div class="col s1"><a class="btn-floating btn-medium waves-effect waves-light black" onclick="javascript:removeElement(\'item-' + 
                itemId + '\'); return false;"><i class="material-icons">remove</i>Remove</a></div></div>';
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
 * Mathods to generate json from the document
 **************************************************************************************************/

// function to iterate and store purchases data as json
function getPurchasesData() {
    var data = {};
    
    var items_div = document.getElementById('items');
    var items = [];
    var total_cost = 0;

    for (var i = 0; i < items_div.children.length; i++) {
        var item = new Object();

        // items div -> p -> row div -> col div -> input element
        item.Name = items_div.children[i].children[0].children[0].children[0].value;
        item.Qty = items_div.children[i].children[0].children[1].children[0].value;
        item.Cost = items_div.children[i].children[0].children[2].children[0].value;
        item.Tax = items_div.children[i].children[0].children[3].children[0].value;
        item.Discount = items_div.children[i].children[0].children[4].children[0].value;
        item.Total = (item.Qty * item.Cost) * (1 + ((item.Tax - item.Discount) / 100.0));

        total_cost += item.Total;
        items.push(item);
    }

    var total_item =  {
        'Name': '',
        'Qty': '',
        'Cost': '',
        'Tax': '',
        'Discount': '',
        'Total': total_cost
    };

    items.push(total_item);

    data['items'] = items;
    data['payment_data'] = getPaymentData(total_cost);

    return data;
}

// function to add payment data into the invoice data
function getPaymentData(total) {  
    var paid_div = document.getElementById('invoice_paid_amount');
    var paid = Number.parseFloat(paid_div.value);
    
    if (isNaN(paid))
        paid = 0;

    var paid_item = {
        'Name': '[ PAID ]',
        'Qty': '',
        'Cost': '',
        'Tax': '',
        'Discount': '',
        'Total': paid
    }

    var balance = total - paid;
    
    var balance_item = {
        'Name': '[ BALANCE ]',
        'Qty': '',
        'Cost': '',
        'Tax': '',
        'Discount': '',
        'Total': balance
    }

    return [paid_item, balance_item];
}

// function to build a json object to store invoice data
function getInvoiceData() {
    var data = {};

    var data_keys = ['company_name', 'company_email', 'company_addr', 'company_web', 'company_tel',
                     'client_name', 'client_tel', 'client_place', 'invoice_date', 'invoice_msg', 'invoice_paid_amount'];

    for (var i = 0; i < data_keys.length; i++) {
        data[data_keys[i]] = document.getElementById(data_keys[i]).value;
    }

    // adding logo if present
    if (document.getElementById('logo_icon').innerHTML == '') {
        data['logo_display'] = document.getElementById('logo_display').innerHTML;
    }

    // to add purchase_list key
    data['purchase_list'] = getPurchasesData();

    // storing balance for history page
    var items = data['purchase_list']['payment_data'];
    var balance = items[items.length - 1]['Total'];
    data['invoice_balance'] = balance;

    return data;
}
