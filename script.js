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
                '<button class="btn btn-danger" onclick="javascript:removeElement(\'item-' + itemId + '\'); return false;">Remove</button>';
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

// function to check when an input file is loaded
window.onload = function() {
    var fileInput = document.getElementById('company_logo');
    var fileDisplayArea = document.getElementById('logo_display');

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

        console.log(fileInput.value);
    });
}

// function to trigger the invisible file input element
function uploadImage() {
    var image_input = document.getElementById('company_logo');
    image_input.click();
}

// orchestrates the creation of invoice
function generatePDF() {
    var doc = new jsPDF();

    generateHeader(doc);
    generateInvoice(doc);

    doc.save('generated_invoice.pdf');
}

function generateHeader(doc) {
    company_name = document.getElementById('company_name').value;
    company_email = document.getElementById('company_email').value;
    company_addr = document.getElementById('company_addr').value;
    company_web = document.getElementById('company_web').value;
    company_tel = document.getElementById('company_tel').value;

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

    if (items.length == 0)
        return;

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
