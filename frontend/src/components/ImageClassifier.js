import React, { useRef, useState } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as tf from '@tensorflow/tfjs';
import './ImageClassifier.css';

tf.setBackend('webgl');

const ImageClassifier = () => {
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [objetReconnu, setObjetReconnu] = useState('');
  const [correctionManuelle, setCorrectionManuelle] = useState('');
  const [taille, setTaille] = useState('');
  const [etat, setEtat] = useState('');
  const imageRef = useRef();
  const fileInputRef = useRef();
  const [imageVisible, setImageVisible] = useState(false);

  const traduireObjet = (nom) => {
    const premierMot = nom.split(',')[0].trim().toLowerCase();
    const dictionnaire = {
      // 🍽️ Cuisine
      'cup': 'tasse', 'coffee mug': 'tasse', 'mug': 'mug',
      'bowl': 'bol', 'plate': 'assiette', 'dutch oven': 'cocotte',
      'coffeepot': 'cafetière', 'coffee maker': 'cafetière électrique',
      'espresso maker': 'cafetière italienne', 'teapot': 'théière',
      'frying pan': 'poêle', 'skillet': 'poêle', 'pan': 'poêle',
      'spoon': 'cuillère', 'fork': 'fourchette', 'knife': 'couteau',
      'bottle': 'bouteille',

      // 🖥️ Électronique
      'laptop': 'ordinateur', 'notebook': 'ordinateur',
      'desktop computer': 'ordinateur', 'pc': 'ordinateur',
      'personal computer': 'ordinateur',
      'monitor': 'écran', 'keyboard': 'clavier', 'mouse': 'souris',
      'remote': 'télécommande',
      'cell phone': 'téléphone', 'mobile phone': 'téléphone',
      'smartphone': 'téléphone', 'iphone': 'téléphone',
      'android phone': 'téléphone',
      'tv': 'télévision', 'television': 'télévision', 'flat screen': 'télévision',
      'tablet': 'tablette', 'ipad': 'tablette',

      // 🪑 Meubles
      'chair': 'chaise', 'folding chair': 'chaise', 'pedestal': 'chaise',
      'table': 'table', 'armoire': 'armoire', 'cabinet': 'armoire',
      'dresser': 'commode', 'shelf': 'étagère', 'bookcase': 'bibliothèque',

      // ⚡ Électroménager
      'iron': 'fer à repasser', 'vacuum': 'aspirateur',
      'washing machine': 'machine à laver', 'dryer': 'sèche-linge',
      'fan': 'ventilateur', 'radiator': 'radiateur',

      // 🎁 Objets divers
      'watch': 'montre', 'digital watch': 'montre',
      'glasses': 'lunettes', 'hat': 'chapeau', 'umbrella': 'parapluie',
      'ring': 'bague', 'bracelet': 'bracelet', 'clock': 'horloge',
      'alarm clock': 'réveil', 'lamp': 'lampe', 'mirror': 'miroir',
      'picture frame': 'cadre',

      // 🎒 Bagagerie
      'backpack': 'sac à dos', 'handbag': 'sac à main',
      'suitcase': 'valise', 'duffel bag': 'sac de sport', 'doormat': 'tapis',

      // 🧸 Enfants
      'stroller': 'poussette', 'toy': 'jouet', 'teddy bear': 'peluche',

      // 📚 Autres
      'book': 'livre', 'shoe': 'chaussure', 'bolotti': 'assiette',
    };
    return dictionnaire[premierMot] || premierMot;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageURL = URL.createObjectURL(file);
    imageRef.current.src = imageURL;
    setImageVisible(true);
    setEstimatedPrice(null);
  };

  const estimerPrix = async () => {
    if (!imageRef.current.src || !taille || !etat) {
      setEstimatedPrice('Veuillez importer une image et choisir taille + état');
      return;
    }

    setLoading(true);
    try {
      const model = await mobilenet.load();
      const predictions = await model.classify(imageRef.current);
      const objet = traduireObjet(predictions[0].className);
      setObjetReconnu(objet);

      const nomFinal = correctionManuelle.trim() || objet;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/objects/estimate?name=${encodeURIComponent(nomFinal)}&size=${encodeURIComponent(taille)}&condition=${encodeURIComponent(etat)}`
      );
      const data = await response.json();

      if (data.price) {
        setEstimatedPrice(data.price);
      } else {
        setEstimatedPrice('Non disponible');
      }
    } catch (error) {
      console.error('Erreur de connexion :', error);
      setEstimatedPrice('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>📷 Estimation de prix</h2>

      <button onClick={() => fileInputRef.current.click()}>📁 Importer une image</button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      <label htmlFor="cameraInput" className="camera-button">📸 Prendre une photo</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        id="cameraInput"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      <br />
      <img ref={imageRef} alt="Aperçu" width="300" />
      <br />

      {imageVisible && (
        <>
          <label>📏 Taille :</label>
          <select value={taille} onChange={(e) => setTaille(e.target.value)}>
            <option value="">-- Choisir --</option>
            <option value="petit">Petit</option>
            <option value="moyen">Moyen</option>
            <option value="grand">Grand</option>
          </select>

          <br />
          <label>🧼 État :</label>
          <select value={etat} onChange={(e) => setEtat(e.target.value)}>
            <option value="">-- Choisir --</option>
            <option value="bon état">Bon état</option>
            <option value="abîmé">Abîmé</option>
            <option value="très bon état">Très bon état</option>
          </select>

          <br />
          <button onClick={estimerPrix}>💰 Estimer le prix</button>
        </>
      )}

      {loading && <p>Analyse en cours...</p>}

      {estimatedPrice && (
        <div>
          <h3>Résultat :</h3>
          <p>Objet reconnu : <strong>{correctionManuelle || objetReconnu}</strong></p>
          <p>Date : {new Date().toLocaleDateString()}</p>
          <p>Heure : {new Date().toLocaleTimeString()}</p>
          <p>Prix estimé : {estimatedPrice} €</p>

          <hr />
          <label>✏️ Correction manuelle :</label>
          <input
            type="text"
            placeholder="Écris ici le nom de l’objet"
            value={correctionManuelle}
            onChange={(e) => setCorrectionManuelle(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;
