let pass = document.getElementById("password");
let address = document.getElementById("address");

// espressioni regolari per la forza delle password
const weakPass = new RegExp("^((?=.*[a-z]).{8,}|(?=.*[a-z])(?=.*[A-Z]).{8,})$");
const mediumPass = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$");
const strongPass = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$");

// gestione degli eventi per la forza della password
function strengthVal() {
    // rimuove le classi di forza della password
    // quando si reinserisce la password
    this.classList.remove("strong", "medium", "weak");

    // cancella le classi di forza
    // quando il campo viene cancellato
    if (this.value == "") this.classList.remove("strong", "medium", "weak");
    // test della password con aggiunta della propria etichetta di classe
    else if (strongPass.test(this.value))
        this.classList.add("strong");
    else if (mediumPass.test(this.value))
        this.classList.add("medium");
    else this.classList.add("weak");
}

document.querySelector("[type='password']").addEventListener('input', strengthVal);
