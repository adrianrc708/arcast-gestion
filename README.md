# 🎬 Arcast (FilmLog) - Puesta en Marcha

Este repositorio contiene un sistema distribuido para la gestión y recomendación de contenido audiovisual. El proyecto se divide en tres servicios principales que deben ejecutarse en paralelo.

## 🛠 Requisitos Previos
* **Node.js** (v18+)
* **Python** (3.9+)
* **MongoDB Atlas** (Cuenta configurada)
* **TMDB API Key** (Obtenida de The Movie Database)

---

## 1. AI Engine (Motor de Recomendación)
Servicio en Flask que procesa las preferencias del usuario para sugerir contenido.

```bash
cd ai-engine
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\activate      # Windows
source venv/bin/activate     # Mac/Linux

pip install Flask requests
python app.py
```
**Puerto:** 5000

---

## 2. API Core (Backend Central)

API REST desarrollada en Express que gestiona la lógica de negocio y la base de datos.

```bash
cd api-core
npm install
```
**Configuración:**  
Crea un archivo `.env` basado en `.env.example` y define:

- `MONGO_URI`
- `JWT_SECRET`
- `TMDB_API_KEY`

---

**Carga Inicial:**
```bash
node seed.js
```
**Ejecución:**
```bash
node server.js
```
**Puerto:** 5001

---

## 3. UI Web (Frontend)

Interfaz de usuario moderna construida con React y Vite.

```bash
cd ui-web
npm install
npm run dev
```
**Acceso:** http://localhost:5173
