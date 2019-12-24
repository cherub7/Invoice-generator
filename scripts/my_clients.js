/**************************************************************************************************
 * Firebase methods to retrieve user clients data
 **************************************************************************************************/

var db = firebase.firestore();

var clientUID = 0;

// retrieve data from Firebase based on user's mail
function retrieveUsersFromFirestore() {
    var user_email = firebase.auth().currentUser.email;
    db.collection("clients").doc(user_email)
    .get()
    .then(function(doc) {
        if (doc.exists) {
            var recv_data = doc.data();
            var data = JSON.parse(recv_data['data']);

            var clients = data['clients'];
            var count = clients.length;

            for (var index = 0; index < count; index++) {
                var client = clients[index];
                addClient(client);
            }
        }
        else {
            alert("You have no clients saved in 'My Clients'");
        }

        // removing loading animation
        var element = document.getElementById('preloader');
        element.parentNode.removeChild(element);
    })
    .catch(function(error) {
        alert("Error fetching clients list.");

        // removing loading animation
        var element = document.getElementById('preloader');
        element.parentNode.removeChild(element)
    });
}

/**************************************************************************************************
 * methods to add/remove/save clients
 **************************************************************************************************/

function removeClient(clientId) {
    var element = document.getElementById(clientId);
    element.parentNode.removeChild(element);
}

function addNewClient() {
    var clientId = 'client-' + clientUID;
    clientUID++;

    var client_name = "<td><input type='text' placeholder='Client Name'></td>";
    var client_number = "<td><input type='number' placeholder='Client Number'></td>";
    var client_place = "<td><input type='text' placeholder='Place'></td>";
    var actions = '<td><a class="btn-floating btn-medium waves-effect waves-light black" onclick="javascript:removeClient(\'' + 
    clientId + '\'); return false;"><i class="material-icons left">delete</i></td>';

    var entry_data = client_name + client_number + client_place + actions;

    var client_entry = document.createElement("tr");
    client_entry.id = clientId;
    client_entry.innerHTML = entry_data;
    
    document.getElementById('user_clients').append(client_entry);
}

function addClient(client) {
    var clientId = 'client-' + clientUID;
    clientUID++;

    var client_name = "<td><input type='text' value='" + client['client_name'] + "'></td>";
    var client_number = "<td><input type='number' value='" + client['client_tel'] + "'></td>";
    var client_place = "<td><input type='text' value='" + client['client_place'] + "'></td>";
    var actions = '<td><a class="btn-floating btn-medium waves-effect waves-light black" onclick="javascript:removeClient(\'' + 
    clientId + '\'); return false;"><i class="material-icons left">delete</i></td>';

    var entry_data = client_name + client_number + client_place + actions;

    var client_entry = document.createElement("tr");
    client_entry.id = clientId;
    client_entry.innerHTML = entry_data;
    
    document.getElementById('user_clients').append(client_entry);
}

function getClientsData() {
    var data = {};

    var clients_div = document.getElementById('user_clients');
    var clients = [];

    for (var i = 0; i < clients_div.children.length; i++) {
        var client = new Object();

        // clients div -> tr -> td -> input element
        client.client_name = clients_div.children[i].children[0].children[0].value;
        client.client_tel = clients_div.children[i].children[1].children[0].value;
        client.client_place = clients_div.children[i].children[2].children[0].value;

        clients.push(client);
    }

    data['clients'] = clients;
    return JSON.stringify(data);
}

function saveClients() {
    var user_email = document.getElementById('user_email').innerText;
    var clients_data = getClientsData();

    db.collection('clients').doc(user_email).set({
        mail: user_email,
        data: clients_data,
    })
    .then(function(docRef) {
        alert("Successfully updated clients list.");
    })
    .catch(function(error) {
        alert("Error updating clients list.");
    });
}