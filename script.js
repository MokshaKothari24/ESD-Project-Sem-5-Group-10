function insertData() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    let name = document.getElementById('txtName').value;
    let password = document.getElementById('txtPassword').value;
    let email = document.getElementById('txtEmail').value;
    let contact = document.getElementById('txtContact').value;
    let account = document.getElementById('txtAccount').value;
    var raw = JSON.stringify({
        'account': account,
        "name": name,
        "password": password,
        'email': email,
        'contact': contact
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:3000/register", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
            alert(result);
        })
        .catch(error => console.log("error", error));

    window.location.href= "index.html";
}

function readData() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    let name = document.getElementById('txtUserName').value;
    let password = document.getElementById('txtUserPassword').value;

    var raw = JSON.stringify({
        "name": name,
        "password": password,
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:3000/login", requestOptions)
        .then(response => response.json())
        .then(result => {

            if(result) {
                alert("Login Successful");
                window.location.href="./index.html";
            }
            else {
                alert("Invalid username or password")
            }
        })
        .catch(error => console.log('error', error));
}

function transfer() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    
    // Get values from input fields
    let senderAccount = parseInt(document.getElementById('txtAccFrom').value);
    let receiverAccount = parseInt(document.getElementById('txtAccTo').value);
    let amount = parseFloat(document.getElementById('txtAmount').value);


    // Create the request body
    var raw = JSON.stringify({
        "senderAccount": senderAccount,
        "receiverAccount": receiverAccount,
        "amount": amount
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:3000/transfer", requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result) {
                alert("Transfer Successful");
            } else {
                alert("Invalid Account From");
            }
        })
        .catch(error => console.log('error', error));
}


function displayData() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    let account = document.getElementById('accfrom').value;
    var raw = JSON.stringify({
        'account': account
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:3000/history", requestOptions)
        .then(response => response.json())
        .then(result => {
            // Clear the existing data before appending new data
            document.getElementById("TransactionData").innerHTML = '';

            result.forEach(element => {
                // Construct the HTML for each transaction entry
                var transactionHTML = `
                    <br>Account From: ${element.accfrom}
                    <br>Account To: ${element.accto}
                    <br>Amount debited/credited: ${element.amt}
                    <br>Balance: ${element.balance}
                    <hr>
                `;
                
                // Append the transaction entry to the container
                document.getElementById("TransactionData").innerHTML += transactionHTML;
            });
        })
        .catch(error => console.log('error', error));
}


function switchTab(tabName) {
    var loginTab = document.getElementById('login-tab');
    var registerTab = document.getElementById('register-tab');
    var loginForm = document.getElementById('login-form');
    var registerForm = document.getElementById('register-form');

    if (tabName === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        changePageTitle('Login form');
    } else if (tabName === 'register') {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        changePageTitle('Registration form');
    }
}

function changePageTitle(newPageTitle) {
    document.title = newPageTitle;
}