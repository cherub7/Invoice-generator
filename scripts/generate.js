/**************************************************************************************************
 * Methods to generate the invoice pdf
 **************************************************************************************************/

// driver function for creating the invoice pdf from a json object
function generatePDF(data, save_to_device, save_to_cloud) {
    var doc = new jsPDF();

    generateHeader(doc, data);
    generateInvoice(doc, data);

    if (save_to_cloud) {
        sendToFirestore(JSON.stringify(data));
    }

    if (save_to_device) {
        doc.save('generated_invoice.pdf');
    }
    else {
        window.open(doc.output('bloburl'));
    }
}

// function to generate header part of the invoice
function generateHeader(doc, data) {
    var company_name = data['company_name'];
    var company_email = data['company_email'];
    var company_addr = data['company_addr'];
    var company_web = data['company_web'];
    var company_tel = data['company_tel'];

    var x_pos = 15;
    var y_pos = 10;

    if (data.logo_display) {
        var src = data['logo_display'];

        var element = document.createElement('div');
        element.innerHTML = src;
        
        var imageFormat = src.substring('<img src="data:image/'.length, src.search(";base64"));
        doc.addImage(element.firstChild, imageFormat, x_pos, y_pos, 35, 35, 'company_logo', 'NONE', 0);
        x_pos += 40;
    }

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(65, 160, 240);

    y_pos += 7;
    doc.text(x_pos, y_pos, company_name);
    
    doc.setTextColor(0,0,0)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    
    // add only entered details into pdf
    if (company_email) { 
        y_pos += 6;
        doc.text(x_pos, y_pos, company_email);
    }

    if (company_addr) { 
        y_pos += 6;
        doc.text(x_pos, y_pos, company_addr);
    }
    
    if (company_web) { 
        y_pos += 6;
        doc.text(x_pos, y_pos, company_web);
    }
    
    if (company_tel) { 
        y_pos += 6;
        doc.text(x_pos, y_pos, company_tel);
    }

    // line to mark the end of header
    // y_pos = 47;
    // doc.line(10, y_pos, 200, 45);
}

// function to generate lower part of the invoice
function generateInvoice(doc, data) {
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(65, 160, 240);

    doc.text(85, 65, 'BILL RECEIPT')
    
    doc.setTextColor(0, 0, 0);

    client_name = data['client_name'];
    client_tel = data['client_tel'];
    client_place = data['client_place'];
    invoice_date = data['invoice_date'];
    invoice_msg = data['invoice_msg'];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    var y_pos = 69;

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

    doc.text(15, y_pos + 10, '     ' + invoice_msg);

    generatePurchaseList(doc, data);
}

function financial(x) {
    return Number.parseFloat(x).toFixed(2);
}

// function to generate the purchases table in the invoice
function generatePurchaseList(doc, data) {
    var purchase_list = data['purchase_list']['items'];

    if (purchase_list.length == 1) {
        return;
    }

    var items = [];
    for (var i = 0; i < purchase_list.length - 1; i++) {
        item = purchase_list[i];
        items.push([item.Name, 
                    item.Qty, 
                    item.Cost + ' (+' + financial(item.Qty * item.Cost) + ')', 
                    item.Tax + '% (+'+ financial((item.Tax / 100.0) * (item.Qty * item.Cost)) +')', 
                    item.Discount + '% (-'+ financial((item.Discount / 100.0) * (item.Qty * item.Cost)) +')', 
                    financial(item.Total)]);
    }
    // last item i.e. total row
    item = purchase_list[purchase_list.length - 1];
    items.push(['[ TOTAL ]', item.Qty, item.Cost, item.Tax, item.Discount, financial(item.Total)]);

    var payment_list = data['purchase_list']['payment_data'];

    if (payment_list) {
        for (var i = 0; i < payment_list.length; i++) {
            item = payment_list[i];
            items.push([item.Name, item.Qty, item.Cost, item.Tax, item.Discount, financial(item.Total)]);
        }
    }
    else {
        items.push(['[ PAID ]', '', '', '', '', financial(item.Total)]);
        items.push(['[ BALANCE ]', '', '', '', '', financial(0)]);
    }

    doc.autoTable({
        startY: 120,
        halign: 'center',
        head: [[ "Name", "Qty", "Cost", "Tax %", "Discount %", "Total"]],
        body: items
    });
}