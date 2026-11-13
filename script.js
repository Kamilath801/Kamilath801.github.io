let suivi = null;

// Afficher les données dans le bloc demandé.
function afficher(position, bloc) {
  const p = position.coords;

  document.getElementById(bloc).textContent =
    "Longitude : " + p.longitude + "°\n" +
    "Latitude : " + p.latitude + "°\n" +
    "Altitude : " + (p.altitude ?? "Non disponible") + "\n" +
    "Précision : " + p.accuracy + " m\n" +
    "Vitesse (m/s) : " + (p.speed ?? "Non disponible") + "\n" +
    "Date : " + new Date(position.timestamp).toLocaleString();
}

// Afficher une erreur.
function erreur(e, bloc) {
  document.getElementById(bloc).textContent =
    "Localisation impossible : " + e.message;
}

// Choisir les options de localisation.
function options() {
  return {
    enableHighAccuracy: document.getElementById("precision").checked,
    timeout: 30000,
    maximumAge: 0
  };
}

// Obtenir la position une seule fois.
document.getElementById("mesurer").onclick = function () {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      afficher(position, "resultatUnique");
    },
    function (e) {
      erreur(e, "resultatUnique");
    },
    options()
  );
};

// Suivre la position.
document.getElementById("demarrer").onclick = function () {
  suivi = navigator.geolocation.watchPosition(
    function (position) {
      afficher(position, "resultatSuivi");
    },
    function (e) {
      erreur(e, "resultatSuivi");
    },
    options()
  );

  document.getElementById("etatSuivi").textContent = "Suivi démarré.";
  document.getElementById("demarrer").disabled = true;
  document.getElementById("arreter").disabled = false;
};

// Arrêter le suivi.
document.getElementById("arreter").onclick = function () {
  navigator.geolocation.clearWatch(suivi);
  suivi = null;

  document.getElementById("etatSuivi").textContent = "Suivi arrêté.";
  document.getElementById("demarrer").disabled = false;
  document.getElementById("arreter").disabled = true;
};