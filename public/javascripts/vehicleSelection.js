var vehicleImages = document.getElementsByClassName("img-veicolo");

for (let image of vehicleImages) {
    image.addEventListener("click", function(){
        if(!image.classList.contains("img-veicolo-selected")) {
            for (let otherImage of vehicleImages) {
                otherImage.classList.remove("img-veicolo-selected");
            }
            image.classList.add("img-veicolo-selected");
        }
    });
}