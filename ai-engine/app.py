from flask import Flask, request, jsonify
import random

app = Flask(__name__)

# Base de datos de conocimiento de la IA (IDs de TMDB reales para la demo)
CONTENT_DATABASE = {
    "Acción": ["550", "155", "272", "24428", "299534"],
    "Sci-Fi": ["157336", "27205", "121", "11", "603"],
    "Drama": ["680", "13", "122", "278", "238"],
    "Terror": ["420634", "135335", "301528"]
}


@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Lógica de IA: Recomendación por filtrado de contenido.
    Recibe los géneros preferidos y calcula la mejor opción.
    """
    try:
        data = request.get_json()
        # Si el usuario no tiene géneros, la IA sugiere Acción por defecto
        user_genres = data.get('preferredGenres', ["Acción"])

        candidates = []
        for genre in user_genres:
            if genre in CONTENT_DATABASE:
                candidates.extend(CONTENT_DATABASE[genre])

        # Eliminamos duplicados y barajamos
        unique_candidates = list(set(candidates))
        random.shuffle(unique_candidates)

        # Retornamos máximo 3 recomendaciones
        final_recommendations = unique_candidates[:3]

        return jsonify({
            "recommendations": final_recommendations,
            "engine": "Arcast-ContentEngine-v1",
            "metadata": {
                "processed_genres": len(user_genres),
                "total_candidates": len(unique_candidates)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Ejecución en el puerto 5000 para el sistema distribuido
    app.run(host='0.0.0.0', port=5000)