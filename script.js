function delData() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let name = document.getElementById('txtUserName').value
    let password = document.getElementById('txtUserPassword').value

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "name": name,
        "password": password
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://localhost:3000/delete", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
            alert(result);
        })
        .catch(error => console.log('error', error));
}

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

    window.location.href = "index.html";
}

function readData() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    let name = document.getElementById('txtUserName').value;
    let password = document.getElementById('txtUserPassword').value;
    let otp = document.getElementById('txtUserOTP').value;

    var raw = JSON.stringify({
        "name": name,
        "password": password,
        "otp": otp
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

            if (result) {
                alert("Login Successful");
                window.location.href = "./home.html";
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

function scheduledtransfer() {
    const scheduledTime = document.getElementById('scheduledTime').value;
    let senderAccount = parseInt(document.getElementById('txtAccFrom').value);
    let receiverAccount = parseInt(document.getElementById('txtAccTo').value);
    let amount = parseFloat(document.getElementById('txtAmount').value);

    // Send a POST request to your backend with the scheduled time and other data
    fetch('http://localhost:3000/schedule-transaction', { // Update the URL to match your backend endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ senderAccount, receiverAccount, amount, scheduledTime })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // Handle the response from the server
        })
        .catch(error => {
            console.error('Error:', error);
        });
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


function verifyOTP() {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    let name = document.getElementById('txtUserName').value;
    let password = document.getElementById('txtUserPassword').value;
    let email = document.getElementById('txtUserEmail').value;

    var raw = JSON.stringify({
        "name": name,
        "password": password,
        "email": email
    });

    var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:3000/verify", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
        })
        .catch(error => console.log("error", error));

    return result;
}

// Function to generate PDF on button click
function generatePDF() {
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

    // Make an AJAX request to the server to trigger PDF generation
    fetch("http://localhost:3000/statement", requestOptions)
        .then(response => {
            if (response.ok) {
                return response.blob(); // Parse the response as a Blob (PDF file)
            } else {
                throw new Error('PDF generation failed');
            }
        })
        .then(blob => {
            // Create a URL for the Blob (PDF) and open it in a new window for download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${account}_account_statement.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => {
            console.error("Error:", error);
            alert("PDF generation failed");
        });

}
