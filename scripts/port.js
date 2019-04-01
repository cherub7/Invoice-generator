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
        elem.firstChild.id = 'logo_display';
    }

    fillPurchaseList(data.purchase_list);
}

function fillPurchaseList(data) {
    console.log(data);
    M.updateTextFields();
}