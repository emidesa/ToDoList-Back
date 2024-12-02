const express = require('express');
const router = express.Router();
const bdd = require('../bdd');

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token.split(' ')[1], 'secret_key', (error, decoded) => {
            if (error) {
                return res.status(401).json({ error: 'Token invalide' });
            }
            req.userID = decoded.id; // Stocke l'ID de l'utilisateur dans la requête
            next();
        });
    } else {
        return res.status(403).json({ error: 'Aucun token fourni' });
    }
};


// Route pour récupérer toutes les tâches
router.get('/allTask', authenticate, (req, res) => {
    const userId = req.userID; // ID de l'utilisateur authentifié

    const sql = 'SELECT * FROM tasks WHERE id_user = ?';
    bdd.query(sql, [userId])
        .then(([results]) => {
            res.json(results);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
        });
});


// Route pour récupérer une tâche par son id
router.get("/:id", (req, res) => {
    const { id } = req.params;
    bdd.query("SELECT * FROM tasks WHERE id = ?", [id])
        .then(([result]) => {
            if (result.length === 0) {
                return res.status(404).json({ error: 'Tâche introuvable' });
            }
            res.json(result[0]);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Erreur lors de la récupération de la tâche' });
        });
});

router.post('/addTask', authenticate, async (req, res) => {
    const { title, description, final_date } = req.body;
    const userId = req.userID;

    // Format the date to YYYY-MM-DD
    const formattedDate = new Date(final_date).toISOString().split('T')[0];

    console.log('Données reçues pour l\'ajout de tâche:', { title, description, final_date: formattedDate, userId });

    try {
        const sql = 'INSERT INTO tasks (id_user, title, description, final_date) VALUES (?, ?, ?, ?)';
        const [result] = await bdd.query(sql, [userId, title, description, formattedDate]);

        console.log('Résultat de l\'insertion:', result);

        const [newTask] = await bdd.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);

        res.status(201).json(newTask[0]);
    } catch (err) {
        console.error('Erreur lors de l\'insertion de la tâche:', err);
        res.status(500).json({ error: "Erreur lors de l'ajout de la tâche", details: err.message });
    }
});

// Existing route for updating a task
router.put('/updateTask/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { title, description, final_date, completes } = req.body;
    const userId = req.userID;

    // Format the date to YYYY-MM-DD
    const formattedDate = new Date(final_date).toISOString().split('T')[0];

    console.log('Données reçues pour la mise à jour:', { id, title, description, final_date: formattedDate, completes, userId });

    try {
        // Vérifier si la tâche existe et appartient à l'utilisateur
        const [taskCheck] = await bdd.query('SELECT * FROM tasks WHERE id = ? AND id_user = ?', [id, userId]);
        
        if (taskCheck.length === 0) {
            console.log('Tâche non trouvée ou non autorisée');
            return res.status(404).json({ error: 'Tâche introuvable ou non autorisée' });
        }

        // Mettre à jour la tâche
        const [result] = await bdd.query(
            'UPDATE tasks SET title = ?, description = ?, final_date = ?, completes = ? WHERE id = ? AND id_user = ?',
            [title, description, formattedDate, completes, id, userId]
        );

        console.log('Résultat de la mise à jour:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Aucune modification effectuée' });
        }

        // Récupérer la tâche mise à jour
        const [updatedTask] = await bdd.query('SELECT * FROM tasks WHERE id = ?', [id]);

        res.json(updatedTask[0]);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la tâche:', err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche', details: err.message });
    }
});


// Route pour supprimer une tâche
router.delete('/deleteTask/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const userId = req.userID;  // ID de l'utilisateur authentifié

    const sql = 'DELETE FROM tasks WHERE id = ? AND id_user = ?';

    bdd.query(sql, [id, userId])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Tâche introuvable ou non autorisée' });
            }
            res.json({ message: 'Tâche supprimée avec succès' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
        });
});



module.exports = router;