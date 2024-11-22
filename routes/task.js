const express = require('express');
const router = express.Router();
const bdd = require('../bdd');


router.get('/allTask', (req, res) => {
    bdd.query('SELECT * FROM tasks', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.get("/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM tasks WHERE id = ?";
    bdd.query(query, [id], (err, result) => {
        if (err) throw err;
      res.json(result[0]);
    });
  });


  router.post('/addTask', (req, res) => {
    const { title, description, final_date, id_user } = req.body;
    const sql = 'INSERT INTO tasks (id_user, title, description, final_date) VALUES (?, ?, ?, ?)';
    
    bdd.query(sql, [id_user, title, description, final_date], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur lors de l\'ajout de la tâche');
        }
        res.json({ id: result.insertId, title, description, final_date, id_user }); // Renvoi de l'ID généré
    });
});


router.post('/updateTask/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, final_date, completes } = req.body;
    const sql = 'UPDATE tasks SET title = ?, description = ?, final_date = ?, completes = ? WHERE id = ?';
    bdd.query(sql, [title, description, final_date, completes, id], (err) => {
        if (err) throw err;
        res.json({ message: 'Tâche mise à jour' });
    });
});


router.post('/deleteTask/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    bdd.query(sql, [id], (err) => {
        if (err) throw err;
        res.json({ message: 'Tâche supprimée' });
    });
});

module.exports = router;