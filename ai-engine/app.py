from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/ai/status")
def status():
    return {"status": "ok", "message": "Motor de IA en línea"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
