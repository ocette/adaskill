const app = document.getElementById("app");
const form = document.getElementById("form");
const themeInput = document.getElementById("theme");
const skillInput = document.getElementById("skill");
const niveauInput = form.querySelector("input[type=range]");

async function loadData() {
  try {
    const response = await fetch("http://localhost:4242/themes-with-skills");
    const themes = await response.json();

    app.innerHTML = ""; // Vide le contenu actuel
    themeInput.innerHTML = '<option value="">Choisir un thème</option>';

    // Parcours chaque thème
    themes.forEach((theme) => {
      console.log(theme);
      renderTheme(theme);

      //Ajout dans le select
      const option = document.createElement("option");
      option.value = theme.id;
      option.textContent = theme.libelle;
      themeInput.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur lors du chargement.", error);
  }
}

function renderTheme(theme) {
  // Conteneur du thème
  const section = document.createElement("section");
  section.className = "section";
  const article = document.createElement("article");
  article.className = "card";

  //Div qui contient le h2
  const divHeader = document.createElement("div");
  divHeader.className = "card-header ";
  // Titre du thème
  const h2 = document.createElement("h2");
  h2.textContent = theme.libelle;
  h2.className = "card-title";

  //Div qui contient la liste
  divContent = document.createElement("div");
  divContent.className = "card-content";
  // Liste des skills
  const ul = document.createElement("ul");
  ul.className = "skills-list";

  theme.skills.forEach((skill) => {
    // Conteneur d'une skill
    const li = document.createElement("li");
    li.classList.add("skill-item");
    li.textContent = skill.intitule;

    // Input range
    const range = document.createElement("input");
    range.type = "range";
    range.min = 0;
    range.max = 5;
    range.value = skill.niveau;
    range.classList.add("skill-item_range");

    // Mettre à jour le niveau en temps réel
    range.addEventListener("change", async () => {
      await fetch(`http://localhost:4242/skills/${skill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niveau: range.value }),
      });
    });

    // Bouton supprimer
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Supprimer la compétence";

    // Interaction : suppression
    deleteBtn.addEventListener("click", async () => {
      await deleteSkill(skill.id);
      loadData();
    });

    ul.appendChild(li);
    li.appendChild(range);
    li.appendChild(deleteBtn);
  });

  app.appendChild(section);
  section.appendChild(article);
  article.appendChild(divHeader);
  article.appendChild(divContent);
  divHeader.appendChild(h2);
  divContent.appendChild(ul);
}

// Pour supprimer un skill
async function deleteSkill(id) {
  await fetch(`http://localhost:4242/skills/${id}`, {
    method: "DELETE",
  });
}

// Pour ajouter un skill une fois le form remplis
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const themes_id = themeInput.value;
  const intitule = skillInput.value;
  const niveau = niveauInput.value;

  if (!themes_id) return;

  await fetch("http://localhost:4242/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intitule,
      niveau,
      themes_id,
    }),
  });

  form.reset();
  loadData();
});

loadData();
