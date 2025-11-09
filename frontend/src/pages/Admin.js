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

const fetchRules = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get('http://localhost:5000/api/objects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRules(res.data);
  } catch (err) {
    console.error('Erreur réseau :', err.message);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('adminToken');
  await axios.post('http://localhost:5000/api/objects', formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  setFormData({ name: '', size: 'petit', condition: 'bon état', price: '' });
  fetchRules();
};

const handleDelete = async (id) => {
  const token = localStorage.getItem('adminToken');
  await axios.delete(`http://localhost:5000/api/objects/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  fetchRules();
};
