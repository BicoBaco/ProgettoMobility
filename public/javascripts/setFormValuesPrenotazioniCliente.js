function setFormValues(idPrenotazione) {
    document.getElementById("hiddenIdPrenotazione").value = idPrenotazione;
    selectVeicolo.innerHTML = "";
    let idParcheggio;
    let tipoVeicolo;
    for(i = 0; i < prenotazioni.length; i++) {
        if(prenotazioni[i].idPrenotazione == idPrenotazione) {
            idParcheggio = prenotazioni[i].idParcheggioPartenza;
            tipoVeicolo = prenotazioni[i].tipoVeicolo;
        }
    }
    for(i = 0; i < veicoli.length; i++) {
        if(veicoli[i].idParcheggio == idParcheggio && veicoli[i].tipo == tipoVeicolo) {
            var opt = document.createElement('option');
            opt.appendChild( document.createTextNode(tipoVeicolo + " n." + veicoli[i].idVeicolo) );
            opt.value = veicoli[i].tipo;    
            opt.id = veicoli[i].idVeicolo;  
            selectVeicolo.appendChild(opt);
        }
    }

    document.getElementById("hiddenIdVeicolo").value = selectVeicolo.options[selectVeicolo.selectedIndex].id;
}
