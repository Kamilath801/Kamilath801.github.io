const affichage = document.getElementById("position");

navigator.geolocation.getCurrentPosition(
  function (position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
const carte = L.map("carte").setView([latitude, longitude], 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(carte);
L.marker([latitude, longitude])
  .addTo(carte)
  .bindPopup("Je suis ici !");
  const nice = [43.7009, 7.2683];

L.marker(nice)
  .addTo(carte)
  .bindPopup("Nice — centre-ville");
    affichage.textContent = `Latitude : ${latitude} | Longitude : ${longitude}`;
  },
  function (erreur) {
    affichage.textContent = "Localisation impossible : " + erreur.message;
  }
);