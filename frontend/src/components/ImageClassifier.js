import React, { useRef, useState, useEffect } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs-backend-webgl';
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
  const [imageVisible, setImageVisible] = useState(false);
  const [selection, setSelection] = useState(null);

  const imageRef = useRef();
  const canvasRef = useRef();
  const fileInputRef = useRef();

  const traduireObjet = (nom) => {
    const premierMot = nom.split(',')[0].trim().toLowerCase();
    const dictionnaire = {
      'cup': 'tasse', 'coffee mug': 'tasse', 'mug': 'mug',
      'bowl': 'bol', 'plate': 'assiette', 'dutch oven': 'cocotte',
      'coffeepot': 'cafetière', 'coffee maker': 'cafetière électrique',
      'espresso maker': 'cafetière italienne', 'teapot': 'théière',
      'frying pan': 'poêle', 'skillet': 'poêle', 'pan': 'poêle',
      'spoon': 'cuillère', 'fork': 'fourchette', 'knife': 'couteau',
      'scabbard': 'fourreau', 'bottle': 'bouteille', 'candle': 'bougie',
      'chair': 'chaise', 'folding chair': 'chaise', 'pedestal': 'chaise',
      'table': 'table', 'armoire': 'armoire', 'cabinet': 'armoire',
      'dresser': 'commode', 'shelf': 'étagère', 'bookcase': 'bibliothèque',
      'studio couch': 'fauteuil-lit', 'wardrobe': 'meuble',
      'iron': 'fer à repasser', 'vacuum': 'aspirateur',
      'washing machine': 'machine à laver', 'dryer': 'sèche-linge',
      'fan': 'ventilateur', 'radiator': 'radiateur',
      'laptop': 'ordinateur', 'monitor': 'écran', 'keyboard': 'clavier',
      'mouse': 'souris', 'remote': 'télécommande',
      'watch': 'montre', 'digital watch': 'montre',
      'glasses': 'lunettes', 'hat': 'chapeau', 'umbrella': 'parapluie',
      'ring': 'bague', 'bracelet': 'bracelet', 'clock': 'horloge',
      'wall clock': 'horloge murale', 'hourglass': 'sablier',
      'alarm clock': 'réveil', 'lamp': 'lampe', 'mirror': 'miroir',
      'picture frame': 'cadre', 'spotlight': 'lampe projecteur',
      'backpack': 'sac à dos', 'handbag': 'sac à main',
      'suitcase': 'valise', 'duffel bag': 'sac de sport',
      'stroller': 'poussette', 'toy': 'jouet', 'teddy bear': 'peluche',
      'rug': 'tapis', 'doormat': 'tapis', 'blanket': 'couverture',
      'pillow': 'oreiller', 'basket': 'panier',
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
    setSelection(null);
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let startX, startY, isDrawing = false;

    const drawRect = (x, y, w, h) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    };

    canvas.onmousedown = (e) => {
      isDrawing = true;
      startX = e.offsetX;
      startY = e.offsetY;
    };

    canvas.onmousemove = (e) => {
      if (!isDrawing) return;
      const width = e.offsetX - startX;
      const height = e.offsetY - startY;
      drawRect(startX, startY, width, height);
    };

    canvas.onmouseup = (e) => {
      isDrawing = false;
      const endX = e.offsetX;
      const endY = e.offsetY;
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      setSelection({ x, y, width, height });
    };
  }, []);

  const estimerPrix = async () => {
    if (!imageRef.current || !selection || !taille || !etat) {
      setEstimatedPrice('Veuillez importer une image, sélectionner une zone, et choisir taille + état');
      return;
    }

    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = selection.width;
      canvas.height = selection.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        imageRef.current,
        selection.x, selection.y, selection.width, selection.height,
        0, 0, selection.width, selection.height
      );

      const croppedImage = tf.browser.fromPixels(canvas);
      const model = await mobilenet.load();
      const predictions = await model.classify(croppedImage);
      const objet = traduireObjet(predictions[0].className);
      setObjetReconnu(objet);

      const nomFinal = correctionManuelle.trim() || objet;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/objects/estimate?name=${encodeURIComponent(nomFinal)}&size=${encodeURIComponent(taille)}&condition=${encodeURIComponent(etat)}`);
      const data = await response.json();

      setEstimatedPrice(data.price || 'Non disponible');
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
      <div style={{ position: 'relative', display: imageVisible ? 'inline-block' : 'none' }}>
        <img ref={imageRef} alt="Aperçu" width="300" />
        <canvas
          ref={canvasRef}
          width={300}
          height={imageRef.current?.height || 300}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
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
