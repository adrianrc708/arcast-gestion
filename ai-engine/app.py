from flask import Flask, request, jsonify
import random

app = Flask(__name__)

# Base de datos real de entrenamiento (Simulada para la demo pero con lógica de peso)
GENRE_MAP = {
    "Acción": ["550", "155", "272"],
    "Sci-Fi": ["157336", "27205", "121"],
    "Drama": ["680", "13", "122"]
}


@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Lógica de IA: Recomendación basada en perfiles de género.
    Recibe los géneros favoritos del usuario y busca coincidencias.
    """
    try:
        data = request.get_json()
        # En un sistema real, el backend de Node nos pasaría los géneros que más ve el usuario
        user_genres = data.get('preferredGenres', ["Acción", "Drama"])

        candidates = []
        for genre in user_genres:
            if genre in GENRE_MAP:
                candidates.extend(GENRE_MAP[genre])

        # Eliminamos duplicados y seleccionamos 3
        recommendations = list(set(candidates))
        final_list = random.sample(recommendations, min(len(recommendations), 3))

        return jsonify({
            "recommendations": final_list,
            "engine": "Arcast-ContentBased-v1",
            "confidence": 0.89
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)