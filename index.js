/* init function purpose is to load the token list from uniswap before the modal is actually called up, otherwise the user has to wait 
 for it to load. init() is initalized when the page is loaded up
 */
 const  qs = require('qs');


//global variables to track if we are "from" or "to" side
let currentTrade = {};
let currentSelectSide; 
let tokens;

async function init() {
    await listAvailableTokens();
}

 async function listAvailableTokens() {
    console.log("initializing");
    let response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
    let tokenListJSON = await response.json();
    console.log("Listing available token: ", tokenListJSON);
    tokens = tokenListJSON.tokens
    console.log("tokens", tokens);

    //Create a token list for the modal
    let parent = document.getElementById("token_list");
    //loop through all tokens inside the token list JSON object
    for (const i in tokens) {
        // Create a row for each token in the list
        let div = document.createElement('div');
        div.className = "token_row";
        //for each row, display the token image and symbol
        let html = `
        <img class="token_list_img" src="${tokens[i].logoURI}">
            <span class="token_list_text">${tokens[i].symbol}</span>
        `;
        div.innerHTML = html;
        div.onclick = () => {
            selectToken(tokens[i]);
        };
        parent.appendChild(div);
    }
 }


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

init();

function selectToken(token) {
    // When a token is selected, automatically close the modal
    closeModal();
    // Track which side of the trade we are on - from/to
    currentTrade[currentSelectSide] = token;
    // Log the selected token
	console.log("currentTrade:" , currentTrade);
    renderInterface();
}

function renderInterface() {
    if (currentTrade.from) {
        // Set the from token image
        document.getElementById("from_token_img").src = currentTrade.from.logoURI;
        // Set the token symbol text
        document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
    }

    if (currentTrade.to) {
        document.getElementById("to_token_img").src = currentTrade.to.logoURI;
        document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
    }
}

function openModal(side) {
    // Store whether the user has selected a token on the from or to side
    currentSelectSide = side;
    document.getElementById("token_modal").style.display = "block";
}

function closeModal() {
    document.getElementById("token_modal").style.display = "none";
}


async function getPrice(){
    console.log("Getting Price");

    if (!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
    let amount = Number(document.getElementById("from_amount").value * 10 ** currentTrade.from.decimals);

    const params = {
      sellToken: currentTrade.from.address,
      buyToken: currentTrade.to.address,
      sellAmount: amount,
    }

    // Fetch the swap price.
    const response = await fetch(
      `https://api.0x.org/swap/v1/price?${qs.stringify(params)}`
      );

    swapPriceJSON = await response.json();
    console.log("Price: ", swapPriceJSON);

    document.getElementById("to_amount").value = swapPriceJSON.buyAmount / (10 ** currentTrade.to.decimals);
    document.getElementById("gas_estimate").innerHTML = swapPriceJSON.estimatedGas;
  }


//onClick events
document.getElementById("from_token_select").onclick = () => {
    openModal("from");
};

document.getElementById("to_token_select").onclick = () => {
    openModal("to");
  };

document.getElementById("modal_close").onclick = closeModal;


document.getElementById("from_amount").onblur = getPrice;


document.getElementById("login_button").onclick = connect;
