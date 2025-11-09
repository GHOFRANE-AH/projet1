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
  const videoRef = useRef();
  const [useCamera, setUseCamera] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);

  const traduireObjet = (nom) => {
    const premierMot = nom.split(',')[0].trim().toLowerCase();
    const dictionnaire = {
      'cup': 'tasse', 'coffee mug': 'tasse', 'mug': 'mug',
      'chair': 'chaise', 'folding chair': 'chaise', 'pedestal': 'chaise',
      'bowl': 'bol', 'plate': 'assiette', 'dutch oven': 'cocotte',
      'coffeepot': 'cafetière', 'coffee maker': 'cafetière électrique',
      'espresso maker': 'cafetière italienne', 'teapot': 'théière',
      'iron': 'fer à repasser', 'vacuum': 'aspirateur', 'book': 'livre',
      'spoon': 'cuillère', 'fork': 'fourchette', 'knife': 'couteau',
      'bottle': 'bouteille', 'table': 'table', 'laptop': 'ordinateur',
      'remote': 'télécommande', 'monitor': 'écran', 'keyboard': 'clavier',
      'mouse': 'souris', 'shoe': 'chaussure', 'backpack': 'sac à dos',
      'handbag': 'sac à main', 'watch': 'montre', 'digital watch': 'montre',
      'glasses': 'lunettes', 'hat': 'chapeau', 'umbrella': 'parapluie',
      'ring': 'bague', 'bracelet': 'bracelet', 'frying pan': 'poêle',
      'skillet': 'poêle', 'pan': 'poêle', 'bolotti': 'assiette',
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
    setUseCamera(false);
  };

  const startCamera = async () => {
    setUseCamera(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const captureFromCamera = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const dataURL = canvas.toDataURL();
    imageRef.current.src = dataURL;
    setImageVisible(true);
    setEstimatedPrice(null);
    setUseCamera(false);
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
  };

  const estimerPrix = async () => {
    if (!imageRef.current.src || !taille || !etat) {
      setEstimatedPrice('Veuillez importer une image et choisir taille + état');
      return;
    }

    setLoading(true);
    const model = await mobilenet.load();
    const predictions = await model.classify(imageRef.current);
    const objet = traduireObjet(predictions[0].className);
    setObjetReconnu(objet);

    const nomFinal = correctionManuelle.trim() || objet;

    fetch(`http://localhost:5000/api/objects/estimate?name=${encodeURIComponent(nomFinal)}&size=${encodeURIComponent(taille)}&condition=${encodeURIComponent(etat)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.price) {
          setEstimatedPrice(data.price);
        } else {
          setEstimatedPrice('Non disponible');
        }
      })
      .catch(() => setEstimatedPrice('Erreur de connexion'))
      .finally(() => setLoading(false));
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

      <button onClick={startCamera}>📸 Prendre une photo</button>

      {useCamera && (
        <div>
          <video ref={videoRef} autoPlay width="300" />
          <br />
          <button onClick={captureFromCamera}>📷 Capturer</button>
        </div>
      )}

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
