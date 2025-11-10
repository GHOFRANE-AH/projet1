import React, { useState } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [accessGranted, setAccessGranted] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    size: 'petit',
    condition: 'bon état',
    price: '',
  });
  const [rules, setRules] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/admin/login`, { password });
      if (res.data.success) {
        setAccessGranted(true);
        fetchRules();
      } else {
        alert('Mot de passe incorrect');
      }
    } catch (err) {
      alert('Erreur de connexion');
    }
  };

  const fetchRules = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/objects`);
      setRules(res.data);
    } catch (err) {
      console.error('Erreur réseau :', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/objects/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/objects`, formData);
      }

      setFormData({
        name: '',
        size: 'petit',
        condition: 'bon état',
        price: '',
      });
      fetchRules();
    } catch (err) {
      alert('Erreur lors de l’enregistrement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/objects/${id}`);
      fetchRules();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      name: rule.name,
      size: rule.size,
      condition: rule.condition,
      price: rule.price,
    });
    setEditingId(rule._id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      size: 'petit',
      condition: 'bon état',
      price: '',
    });
  };

  if (!accessGranted) {
    return (
      <div className="container">
        <h2>🔐 Accès Admin</h2>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <button onClick={handleLogin}>Se connecter</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>{editingId ? '✏️ Modifier une règle' : '📋 Ajouter une règle de prix'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nom de l'objet"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <select
          name="size"
          value={formData.size}
          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
        >
          <option value="petit">Petit</option>
          <option value="moyen">Moyen</option>
          <option value="grand">Grand</option>
        </select>
        <select
          name="condition"
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
        >
          <option value="bon état">Bon état</option>
          <option value="très bon état">Très bon état</option>
          <option value="abîmé">Abîmé</option>
        </select>
        <input
          type="number"
          name="price"
          placeholder="Prix estimé (€)"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
        <button type="submit">{editingId ? 'Mettre à jour' : 'Enregistrer'}</button>
        {editingId && <button type="button" onClick={handleCancelEdit}>Annuler</button>}
      </form>

      <h3>📦 Règles enregistrées</h3>
      <ul>
        {rules.map((rule) => (
          <li key={rule._id}>
            <strong>{rule.name}</strong> — {rule.size}, {rule.condition}, {rule.price} €
            <button onClick={() => handleEdit(rule)}>✏️ Modifier</button>
            <button onClick={() => handleDelete(rule._id)}>🗑️ Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
