// Gestion de la navigation
const toggleNav = (hash) => {
  document.querySelector(`nav a.active`)?.classList.remove("active");
  document.querySelector(`nav a[href="${hash}"]`)?.classList.add("active");
};

const toggleSection = (hash) => {
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => section.classList.remove("active"));
  document.querySelector(`${hash}-section`)?.classList.add("active");
};

const displaySection = (hash) => {
  if (hash === "") hash = "#home";

  const hashSplit = hash.split("-");

  toggleNav(hashSplit[0]);
  toggleSection(hashSplit[0]);
};

window.addEventListener("hashchange", () =>
  displaySection(window.location.hash)
);
displaySection(window.location.hash);

// Dimensions de la carte
const width = 1700;
const height = 950;

// Création de l'élément SVG
const svg = d3
  .select("#map-contains")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Projection de la carte en 2D
const projection = d3
  .geoMercator()
  .scale(1000)
  .center([13, 52]) // Centre de l'Europe
  .translate([width / 2, height / 2]);

// Création d'un générateur de chemins géographiques
const path = d3.geoPath().projection(projection);

// Chargement du fichier GeoJSON
d3.json("europe.geojson").then(function (geojson) {
  // Dessin des pays
  const countries = svg
    .selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "rgb(190, 186, 186)")
    .style("stroke", "black")
    .style("stroke-width", 0.5);

  // Chargement du fichier CSV des capitales
  d3.csv("capitals.csv").then(function (capitalsData) {
    // Convertir les valeurs de latitude et longitude en nombres
    capitalsData.forEach((d) => {
      d.longitude = +d.longitude;
      d.latitude = +d.latitude;
    });

    let selectedCapitals = []; // Tableau pour stocker les capitales sélectionnées

    // Ajout des boutons sur les capitales
    const capitals = svg
      .selectAll("circle")
      .data(capitalsData)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return projection([d.longitude, d.latitude])[0];
      })
      .attr("cy", function (d) {
        return projection([d.longitude, d.latitude])[1];
      })
      .attr("r", 10)
      .style("fill", "white")
      .style("stroke", "black")
      .style("cursor", "pointer")
      .on("mouseover", function (d) {
        // Afficher l'infobulle au survol de la souris
        d3.select(this)
          .append("title")
          .text(function (d) {
            return d.city;
          });
      })
      .on("mouseout", function (d) {
        // Supprimer l'infobulle lorsque la souris quitte le bouton de capitale
        d3.select(this).select("title").remove();
      })
      .on("click", function (d) {
        // Obtenir le prix de la capitale à partir des données CSV
        const capitalPrice = d.srcElement.__data__.prix;

        // Soustraire le prix de la cagnote
        const moneyDiv = document.querySelector("#money");
        moneyDiv.textContent = (
          parseFloat(moneyDiv.textContent) - capitalPrice
        ).toFixed(2);

        // Vérifier si la cagnote est vide

        if (parseInt(moneyDiv.textContent) <= 0) {
          // Désactiver les clics sur les capitales
          capitals.on("click", null);
        }
        // Insérer le prix dans la div #price
        document.querySelector("#price").textContent =
          "-" + capitalPrice + " $";

        // Vérifier si la cagnote est vide

        if (parseInt(moneyDiv.textContent) <= 0) {
          // Game over
          document.querySelector("#price").textContent = "Game Over";
          document.getElementById("bouton").innerHTML = '<button class="fresh" onclick="location.reload();">Recomancer</button>';
        }

        // Changer la couleur du prix en fonction de sa valeur
        if (capitalPrice < 13) {
          document.querySelector("#price").style.color = "green";
          document.querySelector("#perso img").src = "/src/img/personage2.webp";
        } else {
          document.querySelector("#price").style.color = "red";
          document.querySelector("#perso img").src = "/src/img/personage3.webp";
        }

        const selectedCircle = d3.select(this);

        if (selectedCapitals.length > 0) {
          // Récupérer les coordonnées du cercle précédemment sélectionné
          const prevCapital = selectedCapitals[selectedCapitals.length - 1];
          const prevX = +prevCapital.attr("cx");
          const prevY = +prevCapital.attr("cy");

          // Dessiner la ligne entre les deux cercles
          svg
            .append("line")
            .attr("x1", prevX)
            .attr("y1", prevY)
            .attr("x2", +selectedCircle.attr("cx"))
            .attr("y2", +selectedCircle.attr("cy"))
            .style("stroke", "red")
            .style("stroke-width", 2);
        }

        selectedCapitals.push(selectedCircle);
      });
  });
});
