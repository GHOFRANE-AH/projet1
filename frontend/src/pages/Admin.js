import { useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [accessGranted, setAccessGranted] = useState(false);
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    size: 'petit',
    condition: 'bon état',
    price: '',
  });
  const [rules, setRules] = useState([]);

  // 🔐 Connexion avec mot de passe
  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { password });
      localStorage.setItem('adminToken', res.data.token);
      setAccessGranted(true);
      fetchRules();
    } catch (err) {
      alert('Mot de passe incorrect');
    }
  };

  // 📦 Récupération des règles
  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:5000/api/objects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRules(res.data);
    } catch (err) {
      console.error('Erreur réseau :', err.message);
    }
  };

  // 📝 Enregistrement d'une nouvelle règle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:5000/api/objects', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // 🗑️ Suppression d'une règle
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/objects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRules();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  // 🔓 Interface de connexion
  if (!accessGranted) {
    return (
      <div className="container">
        <h2>🔐 Accès Admin</h2>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Se connecter</button>
      </div>
    );
  }

  // ✅ Interface admin après connexion
  return (
    <div className="container">
      <h2>📋 Ajouter une règle de prix</h2>
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
        <button type="submit">Enregistrer</button>
      </form>

      <h3>📦 Règles enregistrées</h3>
      <ul>
        {rules.map((rule) => (
          <li key={rule._id}>
            <strong>{rule.name}</strong> — {rule.size}, {rule.condition}, {rule.price} €
            <button onClick={() => handleDelete(rule._id)}>🗑️ Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
