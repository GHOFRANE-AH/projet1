const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ObjectModel = require('../models/Object'); // Assure-toi que le chemin est correct

// GET toutes les règles
router.get('/', async (req, res) => {
  try {
    const objects = await ObjectModel.find();
    res.json(objects);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des règles' });
  }
});

// POST une nouvelle règle
router.post('/', async (req, res) => {
  try {
    const newObject = new ObjectModel(req.body);
    await newObject.save();
    res.status(201).json(newObject);
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de l’ajout de la règle' });
  }
});

// DELETE une règle
router.delete('/:id', async (req, res) => {
  try {
    await ObjectModel.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la suppression de la règle' });
  }
});

// ✅ NOUVELLE ROUTE : estimation avec name + size + condition
router.get('/estimate', async (req, res) => {
  const { name, size, condition } = req.query;

  if (!name || !size || !condition) {
    return res.status(400).json({ error: 'Tous les paramètres sont requis' });
  }

  try {
    const rule = await ObjectModel.findOne({
      name: name.toLowerCase(),
      size: size.toLowerCase(),
      condition: condition.toLowerCase(),
    });

    if (!rule) {
      return res.json({ price: null });
    }

    res.json({
      name: rule.name,
      size: rule.size,
      condition: rule.condition,
      price: rule.price
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de l’estimation' });
  }
});

module.exports = router;
