/**************************************************************************************************
 * Firebase methods to retrieve user items data
 **************************************************************************************************/

var db = firebase.firestore();

var itemUID = 0;

// retrieve data from Firebase based on user's mail
function retrieveItemsFromFirestore() {
    var user_email = firebase.auth().currentUser.email;
    db.collection("items").doc(user_email)
    .get()
    .then(function(doc) {
        if (doc.exists) {
            var recv_data = doc.data();
            var data = JSON.parse(recv_data['data']);

            var items = data['items'];
            var count = items.length;

            for (var index = 0; index < count; index++) {
                var item = items[index];
                addItem(item);
            }
        }
        else {
            alert("No items found. Try adding items and saving them.");
        }

        // removing loading animation
        var element = document.getElementById('preloader');
        element.parentNode.removeChild(element);
    })
    .catch(function(error) {
        alert("Error fetching items list.");

        // removing loading animation
        var element = document.getElementById('preloader');
        element.parentNode.removeChild(element)
    });
}

/**************************************************************************************************
 * methods to add/remove/save items
 **************************************************************************************************/

function removeItem(itemId) {
    var element = document.getElementById(itemId);
    element.parentNode.removeChild(element);
}

function addNewItem() {
    var itemId = 'item-' + itemUID;
    itemUID++;

    var item_name = "<td><input type='text' placeholder='Item Name'></td>";
    var item_cost = "<td><input type='number' placeholder='Item Cost'></td>";
    var item_tax = "<td><input type='number' placeholder='Tax'></td>";
    var item_discount = "<td><input type='number' placeholder='Discount'></td>";
    var actions = '<td><a class="btn-floating btn-medium waves-effect waves-light black" onclick="javascript:removeItem(\'' + 
    itemId + '\'); return false;"><i class="material-icons left">delete</i></td>';

    var entry_data = item_name + item_cost + item_tax + item_discount + actions;

    var item_entry = document.createElement("tr");
    item_entry.id = itemId;
    item_entry.innerHTML = entry_data;
    
    document.getElementById('user_items').append(item_entry);
}

function addItem(item) {
    var itemId = 'item-' + itemUID;
    itemUID++;

    var item_name = "<td><input type='text' value='"+ item['Name'] + "'></td>";
    var item_cost = "<td><input type='number' value="+ item['Cost'] + "></td>";
    var item_tax = "<td><input type='number' value="+ item['Tax'] + "></td>";
    var item_discount = "<td><input type='number' value="+ item['Discount'] + "></td>";
    var actions = '<td><a class="btn-floating btn-medium waves-effect waves-light black" onclick="javascript:removeItem(\'' + 
    itemId + '\'); return false;"><i class="material-icons left">delete</i></td>';

    var entry_data = item_name + item_cost + item_tax + item_discount + actions;

    var item_entry = document.createElement("tr");
    item_entry.id = itemId;
    item_entry.innerHTML = entry_data;
    
    document.getElementById('user_items').append(item_entry);
}

function getItemsData() {
    var data = {};

    var items_div = document.getElementById('user_items');
    var items = [];

    for (var i = 0; i < items_div.children.length; i++) {
        var item = new Object();

        // items div -> tr -> td -> input element
        item.Name = items_div.children[i].children[0].children[0].value;
        item.Cost = items_div.children[i].children[1].children[0].value;
        item.Tax = items_div.children[i].children[2].children[0].value;
        item.Discount = items_div.children[i].children[3].children[0].value;

        items.push(item);
    }

    data['items'] = items;
    return JSON.stringify(data);
}

function saveItems() {
    var user_email = document.getElementById('user_email').innerText;
    var items_data = getItemsData();

    db.collection('items').doc(user_email).set({
        mail: user_email,
        data: items_data,
    })
    .then(function(docRef) {
        alert("Successfully updated items list.");
    })
    .catch(function(error) {
        alert("Error updating items list.");
    });
}