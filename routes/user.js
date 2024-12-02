const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bdd = require('../bdd');
const bcrypt = require('bcrypt');

// Connexion de l'utilisateur
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await bdd.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length > 0) {
            const user = users[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            const token = jwt.sign({ id: user.id_user }, 'secret_key', { expiresIn: '2h' });
            return res.json({ user, token });
        } else {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Récupérer tous les utilisateurs
router.get('/allUser', async (req, res) => {
    try {
        const [users] = await bdd.query("SELECT * FROM users");
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// Ajouter un utilisateur
router.post('/addUser', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await bdd.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.json({ message: 'Utilisateur ajouté avec succès', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
    }
});

// Récupérer un utilisateur par son ID
router.get('/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const [users] = await bdd.query("SELECT * FROM users WHERE id_user = ?", [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
});

// Mettre à jour un utilisateur
router.put('/updateUser/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await bdd.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id_user = ?', [name, email, hashedPassword, id]);
        res.json({ message: 'Utilisateur mis à jour avec succès' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
});

// Supprimer un utilisateur
router.delete('/deleteUser/:id', async (req, res) => {
    const id_user = req.params.id;
    try {
        await bdd.query("DELETE FROM users WHERE id_user = ?", [id_user]);
        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
});

module.exports = router;

