const positionActuelle = document.getElementById("position");
const suiviPosition = document.getElementById("suivi");

function afficherPosition(position, bloc) {
  const mesure = position.coords;
  const date = new Date(position.timestamp).toLocaleString("fr-FR");

  bloc.textContent =
    `Latitude : ${mesure.latitude}°\n` +
    `Longitude : ${mesure.longitude}°\n` +
    `Altitude (m) : ${mesure.altitude ?? "Non disponible"}\n` +
    `Précision : ${mesure.accuracy.toFixed(2)} m\n` +
    `Vitesse (m/s) : ${mesure.speed ?? "Non disponible"}\n` +
    `Date et heure : ${date}`;
}

function afficherErreur(erreur, bloc) {
  bloc.textContent = "Localisation impossible : " + erreur.message;
}

// Affiche une mesure au chargement de la page.
navigator.geolocation.getCurrentPosition(
  position => afficherPosition(position, positionActuelle),
  erreur => afficherErreur(erreur, positionActuelle)
);

// Actualise le deuxième bloc à chaque nouvelle mesure.
navigator.geolocation.watchPosition(
  position => afficherPosition(position, suiviPosition),
  erreur => afficherErreur(erreur, suiviPosition)
);