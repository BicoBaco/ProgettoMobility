let divLivelli = document.getElementById("sceltaLivelli");

let formLivelli = divLivelli.innerHTML;
divLivelli.innerHTML = "";

function checkShowLevels(idSelect) {
    select = document.getElementById(idSelect);
    if(select.value == "automobile") {
        if (divLivelli.innerHTML == "") {
            divLivelli.innerHTML = formLivelli;
        }
    } else {
        divLivelli.innerHTML = "";
    }
}