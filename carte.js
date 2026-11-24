const nice = [43.7009, 7.2683];
const marseille = [43.2965, 5.3698];

const carte = L.map("carte").setView(nice, 13);

// 1. Deux fonds de carte.
const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(carte);

const ign = L.tileLayer(
  "https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0" +
  "&REQUEST=GetTile&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2" +
  "&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM" +
  "&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
  { maxZoom: 19, attribution: "© IGN — Géoplateforme" }
);

const couches = L.control.layers({
  "OpenStreetMap": osm,
  "Plan IGN (France)": ign
}).addTo(carte);

// 2. Marqueurs et segment Nice–Marseille.
L.marker(nice).addTo(carte).bindPopup("Nice — centre-ville");
L.marker(marseille).addTo(carte).bindPopup("Marseille");
L.polyline([nice, marseille], { color: "blue", dashArray: "8 6" })
  .addTo(carte)
  .bindPopup("Segment Nice–Marseille");

// 3. Triangle des Bermudes : Miami, Bermudes et Porto Rico.
const triangle = L.polygon([
  [25.7617, -80.1918],
  [32.2948, -64.7814],
  [18.4655, -66.1057]
], { color: "red" }).addTo(carte);

document.getElementById("bermudes").onclick = function () {
  // OpenStreetMap couvre aussi la zone du triangle.
  if (carte.hasLayer(ign)) {
    carte.removeLayer(ign);
    osm.addTo(carte);
  }
  carte.fitBounds(triangle.getBounds(), { padding: [20, 20] });
};

// 4. Position, cercle de précision et distance jusqu'à Marseille.
const textePosition = document.getElementById("position");

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude, accuracy } = position.coords;
      const ici = L.latLng(latitude, longitude);

      carte.setView(ici, 15);
      L.marker(ici).addTo(carte).bindPopup("Votre position");

      L.circle(ici, {
        radius: accuracy,
        color: "green"
      }).addTo(carte);

      textePosition.textContent =
        `Précision estimée : ${accuracy.toFixed(1)} m`;

      const distanceKm = ici.distanceTo(marseille) / 1000;
      document.getElementById("distance").textContent =
        `Distance jusqu’à Marseille à vol d’oiseau : ${distanceKm.toFixed(2)} km`;
    },
    function (erreur) {
      textePosition.textContent = "Localisation impossible : " + erreur.message;
    },
    { enableHighAccuracy: true, timeout: 15000 }
  );
} else {
  textePosition.textContent = "Géolocalisation indisponible dans ce navigateur.";
}

// 5. GeoJSON : centres des communes des Alpes-Maritimes.
async function afficherCommunes() {
  try {
    const reponse = await fetch(
      "https://geo.api.gouv.fr/departements/06/communes" +
      "?fields=nom,centre&format=geojson&geometry=centre"
    );

    if (!reponse.ok) throw new Error();

    const communes = await reponse.json();
    const coucheCommunes = L.geoJSON(communes, {
      pointToLayer: function (commune, position) {
        return L.circleMarker(position, { radius: 4, color: "purple" });
      },
      onEachFeature: function (commune, point) {
        const nom = document.createElement("span");
        nom.textContent = commune.properties.nom;
        point.bindPopup(nom);
      }
    });

    couches.addOverlay(coucheCommunes, "Communes des Alpes-Maritimes");
  } catch {
    document.getElementById("carte").insertAdjacentText(
      "afterend", "Impossible de charger les communes."
    );
  }
}

afficherCommunes();

// 6. Trajet routier Nice–Marseille.
const boutonTrajet = document.getElementById("trajet");
const etatTrajet = document.getElementById("etatTrajet");

boutonTrajet.onclick = async function () {
  boutonTrajet.disabled = true;
  etatTrajet.textContent = "Calcul du trajet…";

  try {
    // OSRM attend longitude,latitude.
    const depart = `${nice[1]},${nice[0]}`;
    const arrivee = `${marseille[1]},${marseille[0]}`;

    const reponse = await fetch(
      "https://routing.openstreetmap.de/routed-car/route/v1/driving/" +
      `${depart};${arrivee}?overview=full&geometries=geojson`
    );

    if (!reponse.ok) throw new Error();

    const resultat = await reponse.json();
    if (resultat.code !== "Ok" || !resultat.routes.length) throw new Error();

    const route = resultat.routes[0];
    const ligne = L.geoJSON(route.geometry, {
      style: { color: "orange", weight: 5 }
    }).addTo(carte);

    carte.fitBounds(ligne.getBounds(), { padding: [20, 20] });
    etatTrajet.textContent =
      `Trajet routier Nice–Marseille : ${(route.distance / 1000).toFixed(1)} km`;
  } catch {
    etatTrajet.textContent = "Trajet indisponible. Tu peux réessayer.";
    boutonTrajet.disabled = false;
  }
};