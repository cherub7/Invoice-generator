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

                img.id = "logo_image";
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

        item.Name = items_div.children[i].children[0].children[0].value;
        item.Qty = items_div.children[i].children[0].children[1].value;
        item.Cost = items_div.children[i].children[0].children[2].value;

        total_cost += item.Qty * item.Cost;
        items.push(item);
    }

    data['items'] = items;

    return data;
}

// function to build a json object to store invoice data
function getInvoiceData() {
    var data = {};

    var data_keys = ['company_name', 'company_email', 'company_addr', 'company_web', 'company_tel',
                     'client_name', 'client_tel', 'client_place', 'invoice_date', 'invoice_msg'];

    for (var i = 0; i < data_keys.length; i++) {
        data[data_keys[i]] = document.getElementById(data_keys[i]).value;
    }

    // adding logo if present
    if (document.getElementById('logo_display').innerHTML != '') {
        data['logo_display'] = document.getElementById('logo_display').innerHTML;
    }

    // to add purchase_list key
    data['purchase_list'] = getPurchasesData();

    return data;
}

/**************************************************************************************************
 * handlers for user button click actions
 **************************************************************************************************/

function previewInvoice() {
    var data = getInvoiceData();
    generatePDF(data, false, false);
}

function downloadInvoice() {
    var data =  getInvoiceData();
    generatePDF(data, true, true);
}

/**************************************************************************************************
 * Variables and Methods to handle localStorage
 **************************************************************************************************/

var keys = [ 'company_name', 'company_email', 'company_addr', 'company_web', 'company_tel' ];
var store = window.localStorage;

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

/**************************************************************************************************
 * Firebase store methods
 **************************************************************************************************/

var db = firebase.firestore();

// store the json as string and reconstruct pdf when user wants to download
function sendToFirestore(data) {
    var user_email = document.getElementById('user_email').innerText;

    db.collection('data').add({
        mail: user_email,
        data: data,
        time: firebase.firestore.Timestamp.fromDate(new Date())
    })
    .then(function(docRef) {
    })
    .catch(function(error) {
        alert("Error adding document to cloud.");
    });
}
