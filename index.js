$(document).ready(function () {
  //// Notification of the success of information transfer or a failure in information transfer ////
  getCoinsData
    .done((data) => createCoinCard(data))
    .fail((err) => console.log(err.responseText));
});

//// Grabbing all the buttons ////
$("#listOfCoins").on("click", "#coinValue", handleLocalStorage);
$("#searchButton").click(() => coinCardSearch(event));
$("#homeButton").on("click", changePages);
$("#reportsButton").on("click", changePages);
$("#aboutButton").on("click", changePages);
$("#quitModal").on("click", hideModal);
$(".btn-close").on("click", hideModal);
$("#saveChanges").on("click", SaveModel);
 let chosenCoins = [];
 const arrData = [];

//// First Call ajax ////
const getCoinsData = $.getJSON({
  type: "GET",
  dataType: "json",
  url: "./data.json",
});

//// Page Navigation ////
function changePages() {
  const element = this.target;
   $("section").addClass("d-none");
   $(`${element}`).removeClass("d-none");
    return element;
}

//// Create coin card ////
function createCoinCard(data) {
 $.each(data, (index, value) => {
   const id = randomId();
     $("#listOfCoins").append(
      `<div class="card col-4 m-2" style="width: 19rem" target = "${value.symbol} ${value.id}" >
        <div class="card-body">
         <img
          src="${value.image}"
          alt="${value.name}"
          width="40"
          height="40">
          <div class="form-check form-switch">
          <div class="float-end">
            <input
              class=".toggle-${value.id} tokenCurrency form-check-input"
              type="checkbox"
              role="switch"
              id="${value.id}"/>
              <label
                class="form-check-label"
                for="flexSwitchCheckDefault"></label>
          </div>
            <h5 class="card-title">${value.symbol}</h5>
             <p class="card-text">${value.name}</p>
            <button 
              title ="${value.id}"
               class="moreInfo btn btn-success"
               id = "coinValue"
               type="button"
               data-bs-toggle="collapse"
               data-bs-target="#${id}"
               aria-expanded="false">
            <div class="spinner-border text-dark ${id}Spinner">
                 <span class="visually-hidden">Loading...</span>
            </div>
                  More info
                </button>
            <div class="collapse ${value.id} " target="${value.id}" id =${id}>
            </div>
            </div>
            </div>
            </div>
            </div>`
    );
    $(`.${id}Spinner`).hide();
  });
  $(".tokenCurrency").one("click", function () {
    handleToggle($(this));
  });
}

//// Create information from the more info use in the data created "dataToStorage"/////
function createMoreInfo(data) {
$(`.${data.id}`).html(
`<div class="card card-body" id =collapse-info>
  <p class= mb-2>Israel shekel: ${data.ils} <small>₪</small></p>
  <p class= mb-2>American dollar: ${data.usd} <small>$</small></p>
  <p class= mb-2>American dollar: ${data.eur} <small>€</small></p>
 </div>
`
  );
}

//// Second call fetch for the second information ////  
async function handleLocalStorage() {
  const id = this.title;
  $(`.${id}Spinner`).show();
  // get data from storage to check the tim in it
  const localData = JSON.parse(window.localStorage.getItem(id));
  // get current time fo checking
  const now = new Date().getTime();
  if (localData && now - localData.callTime < 120000) {
    // if 2 min didnet pass use the data in storage and data exist in storage
    createMoreInfo(localData);
  } else {
    // if 2 min was passed or data wasent in storage (firsl call) -> cal api
    await fetch(`https://api.coingecko.com/api/v3/coins/${id}`).then(
      (resolve) => {
        resolve.json().then((data) => {
          //get time of call to api
          const time = new Date().getTime();

          // create elemet to use in storge and in render
          const dataToStorage = {
            id: id,
            callTime: time,
            ils: data.market_data.current_price.ils,
            usd: data.market_data.current_price.usd,
            eur: data.market_data.current_price.eur,
          };

          // send data to render funcion
          createMoreInfo(dataToStorage);
          // enter data lo local storage by name
          const setItemLocal = window.localStorage.setItem(
            dataToStorage.id,
            JSON.stringify(dataToStorage)
          );
        });
      }
    );
  }

  $(`.${id}Spinner`).hide();
}

//// function that create random id ////
function randomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");
  let id = "";
  for (var i = 0; i < 10; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

//// Attractive coin card search ////
function coinCardSearch(event) {
  const input = $(event.target).prev().val();
  $("#listOfCoins")
    .children()
    .each((i, div) => {
      const coin = div.attributes.target.value;
      if (coin.indexOf(input) > -1) {
        $(div).removeClass("d-none");
      } else {
        $(div).addClass("d-none");
      }
    });
}

//// Turning on the toggle button ////     
function handleToggle(element) {
  const coinID = element.attr("id");
  if (element[0].checked == true && chosenCoins.length < 5) {
    chosenCoins.push(coinID);
  } else if (element[0].checked == false) {
    chosenCoins.splice(chosenCoins.indexOf(coinID), 1);
  } else {
    element[0].checked = false;
    alert(
      "We are sorry, but it is not possible to select more than five coins."
    );
    modalFunction();
  }
}


//// Injecting toggle buttons into the moodal ////
function modalFunction() {
  const arrCoin = chosenCoins;
  $(".modal").show();
  $.each(arrCoin, (index, value) => {
    $(".modal-body").append(`<div class="form-check form-switch">
      <input
        class="form-check-input"
        type="checkbox"
        role="switch"
        id="${value}"
        checked
      />
      <label
        class="form-check-label"
        for=${value}>${value}</label>
    </div> `);
  });
}

//// Model disappearance in click events ////
function hideModal() {
  $(".modal").hide();
}

// model Save BTN //
function SaveModel() {
  const removed = [];
  const toggler = $(".modal-body").children().children("input");
  $.each(toggler, (i, v) => {
    if (v.checked != true) {
      removed.push(v.id);
      chosenCoins.splice(chosenCoins.indexOf(v.id), 1);
    }
  });

  changeToggleMainScreen(removed);
}

// change toggle state as a result of changes in model //
function changeToggleMainScreen(removed) {
  $.each(removed, (i, id) => {
    console.log($(id).checked);
    $(`#` + id)[0].checked = false;
  });
}















