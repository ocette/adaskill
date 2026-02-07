require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 4242;

//Middlewares
app.use(cors());
app.use(express.json());

// Initialisation de la connexion Neon
const sql = neon(`${process.env.DATABASE_URL}`);

// Route de test
app.get("/", async (_, res) => {
  const response = await sql`SELECT version()`;
  const { version } = response[0];
  res.json({ version });
});

// Récupérer tous les thèmes
app.get("/themes", async (req, res) => {
  try {
    const themes = await sql`SELECT * FROM themes ORDER BY id`;
    res.json(themes);
  } catch (error) {
    console.error("Erreur lors de la récupération des thèmes", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer tous les skills
app.get("/skills", async (req, res) => {
  try {
    const skills = await sql`SELECT * FROM skills ORDER BY themes_id, id`;
    res.json(skills);
  } catch (error) {
    console.error("Erreur lors de la récupération des skills", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Ajouter un thème
app.post("/themes", express.json(), async (req, res) => {
  try {
    const { libelle } = req.body;

    const result = await sql`
      INSERT INTO themes (libelle)
      VALUES (${libelle})
      RETURNING *
    `;

    res.json(result[0]);
  } catch (error) {
    console.error("Erreur lors de l'ajout du thème", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Ajouter un skill
app.post("/skills", express.json(), async (req, res) => {
  try {
    const { intitule, niveau, themes_id } = req.body;

    const result = await sql`
      INSERT INTO skills (intitule, niveau, themes_id)
      VALUES (${intitule}, ${niveau}, ${themes_id})
      RETURNING *
    `;

    res.json(result[0]);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la skill", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer un skill
app.delete("/skills/:id", async (req, res) => {
  try {
    await sql`DELETE FROM skills WHERE id = ${req.params.id}`;
    res.json({ message: "Skill supprimée" });
  } catch (error) {
    console.error("Erreur lors de la suppression", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});
