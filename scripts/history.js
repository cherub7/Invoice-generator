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
        var sno = 1;
        querySnapshot.forEach(function(doc) {
            var recv_data = doc.data();
            var invoice = JSON.parse(recv_data['data']);

            var preview_button = '<a class="btn-floating btn-medium waves-effect waves-light black" onclick="previewInvoice(\'' + doc.id + '\')"><i class="material-icons left">visibility</i></a> ';
            var download_button = '<a class="btn-floating btn-medium waves-effect waves-light black" onclick="downloadInvoice(\'' + doc.id + '\')"><i class="material-icons left">picture_as_pdf</i></a>';
            var entry_data = "<td>" + sno + "</td><td>" + invoice['client_name'] + "</td><td>" + invoice['invoice_date'] + "</td><td>" + preview_button + download_button + "</td>";
            
            var history_entry = document.createElement("tr");
            history_entry.innerHTML = entry_data;
            document.getElementById('user_data').append(history_entry);

            sno++;
        });
    })
    .catch(function(error) {
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
            alert("Oops! No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document :(", error);
    });
}

function downloadInvoice(doc_id) {
    var docRef = db.collection("data").doc(doc_id);

    docRef.get().then(function(doc) {
        if (doc.exists) {
            var data = JSON.parse(doc.data().data);
            generatePDF(data, true, false);
        } else {
            alert("Oops! No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document :(", error);
    });
}