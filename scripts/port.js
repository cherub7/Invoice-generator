/**************************************************************************************************
 * Import/Export invoice methods
 **************************************************************************************************/

function exportInvoice(anchor_id, data) {
    if (!data) {
        data = getInvoiceData();
    }

    var export_anchor = document.getElementById(anchor_id);
    var file = new Blob([JSON.stringify(data)], {type: 'text'});
    export_anchor.href = URL.createObjectURL(file);
    export_anchor.download = 'invoice_export';
}

function importInvoice(input_id) {
    document.getElementById(input_id).click();
}

function fillInvoice(data) {
    for (var key in data) {
        var elem = document.getElementById(key);
        if (elem) {
            elem.value = data[key];
        }
    }

    if (data.logo_display) {
        var elem = document.getElementById('logo_display');
        elem.innerHTML = data['logo_display'];
        elem.firstChild.id = 'logo_image';
        
        document.getElementById('logo_icon').innerHTML = '';
    }
    else {
        var elem = document.getElementById('logo_display');
        elem.innerHTML = '';
        document.getElementById('logo_icon').innerHTML = '<i class="fas fa-camera"></i>';
    }

    M.updateTextFields();
    fillPurchaseList(data.purchase_list.items);
}

function fillPurchaseList(data) {
    document.getElementById('items').innerHTML = '';
    itemId = 0;
    
    var items_count = data.length;
    if (items_count <= 1)
        return;

    for (var i = 1; i <= items_count - 1; i++) {
        addItem();
        var item_id = 'item-' + i;

        // p element -> row div - > col div -> input element 
        document.getElementById(item_id).firstChild.childNodes[0].firstChild.value = data[i-1].Name;
        document.getElementById(item_id).firstChild.childNodes[1].firstChild.value = data[i-1].Qty;
        document.getElementById(item_id).firstChild.childNodes[2].firstChild.value = data[i-1].Cost;
        document.getElementById(item_id).firstChild.childNodes[3].firstChild.value = data[i-1].Tax;
        document.getElementById(item_id).firstChild.childNodes[4].firstChild.value = data[i-1].Discount;
    }

    M.updateTextFields();
}