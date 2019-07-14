/**************************************************************************************************
 * Firebase methods to retrieve user data
 **************************************************************************************************/

var db = firebase.firestore();

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
            var delete_button = '<a id="del-' + doc.id + '" class="btn-floating btn-medium waves-effect waves-light black" onclick="deleteInvoice(\'' + doc.id + '\')"><i class="material-icons left">delete</i></a>';
            
            var entry_data = "<td>" + invoice['client_name'] + "</td><td>" + invoice["client_place"] + "</td><td>" + invoice['invoice_date'] + "</td><td>" + preview_button + download_button + export_button + delete_button + "</td>";
            
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