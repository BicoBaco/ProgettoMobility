function updateFormValues(idPrenotazione) {
    console.log(dictPrenotazioni[idPrenotazione]);

    selectStato.value = dictPrenotazioni[idPrenotazione].stato;

    selectParcheggioPartenza.value = dictPrenotazioni[idPrenotazione].idParcheggioPartenza;
    selectParcheggioArrivo.value = dictPrenotazioni[idPrenotazione].idParcheggioArrivo;

    pickerDataPartenza.value = dictPrenotazioni[idPrenotazione].dataPartenza;
    pickerOrarioPartenza.value = dictPrenotazioni[idPrenotazione].orarioPartenza;
    
    pickerDataArrivo.value = dictPrenotazioni[idPrenotazione].dataArrivo;
    pickerOrarioArrivo.value = dictPrenotazioni[idPrenotazione].orarioArrivo;
    console.log(pickerOrarioArrivo);

    hiddenOrarioPartenza.value = dictPrenotazioni[idPrenotazione].orarioPartenza;
    hiddenOrarioArrivo.value = dictPrenotazioni[idPrenotazione].orarioArrivo;

    hiddenDataPartenza.value = dictPrenotazioni[idPrenotazione].dataPartenza;
    hiddenDataArrivo.value = dictPrenotazioni[idPrenotazione].dataArrivo;

    for(i = 0; i < inputsID.length; i++) {
        inputsID[i].value = idPrenotazione;
    }
}