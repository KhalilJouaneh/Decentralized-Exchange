async function connect() {
    /** MetaMask injects a global API into websites visited by its users at `window.ethereum`. This API allows websites to request users' Ethereum accounts, read data from blockchains the user is connected to, and suggest that the user sign messages and transactions. The presence of the provider object indicates an Ethereum user. Read more: https://ethereum.stackexchange.com/a/68294/85979**/

    // Check if MetaMask is installed, if it is, try connecting to an account

    if (typeof window.ethereum !== "undefined") {
        try {
            console.log("connecting");
            // Requests that the user provides an Ethereum address to be identified by. The request causes a MetaMask popup to appear. Read more: https://docs.metamask.io/guide/rpc-api.html#eth-requestaccounts
            await ethereum.request({method: 'eth_requestAccounts'});
        } catch (error) {
            console.log(error);
        }
        // If connected, change button to "Connected"
        document.getElementById("login_button").innerHTML = "Connected";
        //if connected, enable swap
        document.getElementById("swap_button").disabled = false;
    } else {
        //Ask user to install Metamask if not detected 
        document.getElementById("login_button").innerHTML = "Please install metamask";
    }
}

document.getElementById("login_button").onclick = connect;
