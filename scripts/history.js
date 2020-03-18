/**************************************************************************************************
 * Firebase methods to retrieve user data
 **************************************************************************************************/

var db = firebase.firestore();

function getPaymentStatus(balance, doc_id) {
    let status_content = "<b style='color: green;'>PAID IN FULL </b>";
    var edit_button = '<a id="edit-' + doc_id + '" class="btn-floating btn-small waves-effect waves-light grey" onclick="editInvoiceBalance(\'' + doc_id + '\')"><i class="material-icons left">edit</i></a>';

    if (!(balance === undefined || balance === 0)) {
        status_content = `<b style='color: red;'>DUE</b> <div class='new chip'>${balance}</div>`;
    }

    return `<div id='status-${doc_id}'>${status_content} ${edit_button}</div>`;
}

// retrieve data from Firebase based on user's mail
function retrieveFromFirestore() {
    var user_email = firebase.auth().currentUser.email;
    db.collection("data").where("mail", "==", user_email)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var recv_data = doc.data();
            var invoice = JSON.parse(recv_data['data']);

            var preview_button = '<a class="btn-floating btn-medium waves-effect waves-light black" onclick="previewInvoice(\'' + doc.id + '\')"><i class="material-icons left">visibility</i></a> ';
            var download_button = '<a class="btn-floating btn-medium waves-effect waves-light black" onclick="downloadInvoice(\'' + doc.id + '\')"><i class="material-icons left">picture_as_pdf</i></a> ' ;
            var export_button = '<a id="anc-' + doc.id + '" class="btn-floating btn-medium waves-effect waves-light black" onclick="exportHistoryInvoice(\'' + doc.id + '\')"><i class="material-icons left">note_add</i></a> ';
            var edit_button = '<a id="edt-' + doc.id + '" class="btn-floating btn-medium waves-effect waves-light black" href="./edit_invoice.html?id=' + doc.id + '"><i class="material-icons left">edit</i></a> ';
            var delete_button = '<a id="del-' + doc.id + '" class="btn-floating btn-medium waves-effect waves-light black" onclick="deleteInvoice(\'' + doc.id + '\')"><i class="material-icons left">delete</i></a>';

            var entry_data = "<td>" + invoice['client_name'] + "</td><td>" + invoice["client_place"] + "</td><td>" + invoice['invoice_date'] + "</td><td>" + getPaymentStatus(invoice["invoice_balance"], doc.id) + "</td><td>" + preview_button + download_button + export_button + edit_button + delete_button + "</td>";
            
            var history_entry = document.createElement("tr");
            history_entry.innerHTML = entry_data;
            document.getElementById('user_data').append(history_entry);
        });

        // removing loading animation
        var element = document.getElementById('preloader');
        element.parentNode.removeChild(element);
    })
    .catch(function(error) {
        console.log(error);
        alert("Error getting documents :(");
    });
}

/**************************************************************************************************
 * handlers for user button click actions
 **************************************************************************************************/

function setInvoiceBalanceStatus(doc_id, statusContent) {
    let status_element = document.getElementById(`status-${doc_id}`);
    status_element.innerHTML = statusContent;
}

function editInvoiceBalance(doc_id) {
    const prev_status = document.getElementById(`status-${doc_id}`).innerHTML;

    let save_button = document.createElement('a');
    save_button.className = "btn-floating btn-small waves-effect waves-light black";
    save_button.innerHTML = "<i class='material-icons left'>check</i>";
    save_button.onclick = () => {
        let balance_elem = document.getElementById(`balance-${doc_id}`);
        let balance = Number.parseFloat(balance_elem.value);
        if (isNaN(balance))
            balance = 0;
        setInvoiceBalanceStatus(doc_id, getPaymentStatus(balance, doc_id));
        updateInvoiceBalance(doc_id, balance);
    };

    let cancel_button = document.createElement('a');
    cancel_button.className = "btn-floating btn-small waves-effect waves-light red";
    cancel_button.innerHTML = "<i class='material-icons left'>close</i>";
    cancel_button.onclick = () => {
        setInvoiceBalanceStatus(doc_id, prev_status);
    };


    let edit_status = `
        <div class="row">
            <div class="col s6 offset-s3">
                <input id="balance-${doc_id}" type='text' placeholder='Balance'/>
            </div>
        </div>
        <div class="row">
            <div id="save-${doc_id}" class="col s3 offset-s3">
            </div>
            <div id="cancel-${doc_id}" class="col s3">
            </div>
        </div>`;

    setInvoiceBalanceStatus(doc_id, edit_status);
    document.getElementById(`save-${doc_id}`).append(save_button);
    document.getElementById(`cancel-${doc_id}`).append(cancel_button);
}

function updateInvoiceBalance(doc_id, new_balance) {
    var user_email = document.getElementById('user_email').innerText;
    var docRef = db.collection("data").doc(doc_id);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            var data = JSON.parse(doc.data().data);
            let items = data['purchase_list']['items'];
            
            let total = items[items.length - 1]['Total'];
            var balance = new_balance;
            var paid = total - balance;

            // adding payment-data if it doesn't exist
            if (data['purchase_list']['payment_data'] === undefined) {
                var paid_item = {
                    'Name': '[ PAID ]',
                    'Qty': '',
                    'Cost': '',
                    'Tax': '',
                    'Discount': '',
                    'Total': paid
                }
                
                var balance_item = {
                    'Name': '[ BALANCE ]',
                    'Qty': '',
                    'Cost': '',
                    'Tax': '',
                    'Discount': '',
                    'Total': balance
                }

                data['purchase_list']['payment_data'] = [paid_item, balance_item];
            }
            
            data['invoice_paid_amount'] = paid;
            data['purchase_list']['payment_data'][0]['Total'] = paid;

            data['invoice_balance'] = balance;
            data['purchase_list']['payment_data'][1]['Total'] = balance;

            db.collection('data').doc(doc_id).set({
                data: JSON.stringify(data),
                mail: user_email,
                time: firebase.firestore.Timestamp.fromDate(new Date())
            })
            .then(function(docRef) {
                alert("Successfully updated invoice balance.");
            })
            .catch(function(error) {
                alert("Error while updating invoice balance.");
            });

        } else {
            alert("Error fetching invoice data.");
        }
    }).catch(function(error) {
        alert("No such invoice exists!", error);
    });
}

function previewInvoice(doc_id) {
    var docRef = db.collection("data").doc(doc_id);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            var data = JSON.parse(doc.data().data);
            generatePDF(data, false, false);
        } else {
            alert("No such document exists.");
        }
    }).catch(function(error) {
        alert("Error getting document.", error);
    });
}

function downloadInvoice(doc_id) {
    var docRef = db.collection("data").doc(doc_id);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            var data = JSON.parse(doc.data().data);
            generatePDF(data, true, false);
        } else {
            alert("No such document exists.");
        }
    }).catch(function(error) {
        alert("Error getting document.", error);
    });
}

function exportHistoryInvoice(doc_id) {
    var docRef = db.collection("data").doc(doc_id);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            var data = JSON.parse(doc.data().data);
            exportInvoice('anc-' + doc_id, data);
        } else {
            alert("No such document exists.");
        }
    }).catch(function(error) {
        alert("Error getting document.", error);
    });
}

function deleteInvoice(doc_id)  {
    db.collection("data").doc(doc_id).delete().then(function() {
        document.getElementById('del-' + doc_id).parentElement.parentElement.remove();
    }).catch(function(error) {
        alert("Error removing document.");
    });
}