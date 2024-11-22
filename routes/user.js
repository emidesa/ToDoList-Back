const express = require('express');
const router = express.Router();
const bdd = require('../bdd'); // Assurez-vous que votre fichier de connexion à la BDD est correct
const bodyParser = require('body-parser');

router.use(bodyParser.json());


// Connexion de l'utilisateur
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Vérification de l'utilisateur dans la base de données
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    
    bdd.query(query, [email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (result.length > 0) {
            // L'utilisateur existe
            const user = result[0];
            res.json({ user }); // Répondre avec les informations de l'utilisateur
        } else {
            // Utilisateur non trouvé
            res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
    });
});

// Récupérer tous les utilisateurs
router.get('/allUser', (req, res) => {
    const getAllUser = "SELECT * FROM users";

    bdd.query(getAllUser, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
        }
        res.json(result);
    });
});

// Ajouter un utilisateur
router.post('/addUser', (req, res) => {
    const { name, email, password } = req.body;
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    
    bdd.query(sql, [name, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
        }
        res.json({ message: 'Utilisateur ajouté avec succès', id: result.insertId });
    });
});

// Récupérer un utilisateur par son ID
router.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    const getUserQuery = "SELECT * FROM users WHERE id_user = ?";

    bdd.query(getUserQuery, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
        }
        res.json(result[0]);
    });
});

// Mettre à jour un utilisateur
router.put('/updateUser/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id_user = ?';

    bdd.query(sql, [name, email, password, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
        }
        res.json({ message: 'Utilisateur mis à jour avec succès' });
    });
});

// Supprimer un utilisateur
router.delete('/deleteUser/:id', (req, res) => {
    const userId = req.params.id;
    const deleteUserQuery = "DELETE FROM users WHERE id_user = ?";

    bdd.query(deleteUserQuery, [userId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
        }
        res.json({ message: "Utilisateur supprimé avec succès" });
    });
});

module.exports = router;
