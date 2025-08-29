import os
import time
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(BASE_DIR, "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

# mount static and audio directories
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))


@app.get("/")
def index(request: Request):
    """Render the frontend page."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Save uploaded audio to /audio and transcribe using extract.get_text.

    NOTE: import extract inside the handler so the app can start even if heavy deps
    (like faster_whisper) are missing until transcription is requested.
    """
    # sanitize and create filename
    ext = os.path.splitext(file.filename)[1] or ".webm"
    filename = f"audio_{int(time.time())}{ext}"
    dest_path = os.path.join(AUDIO_DIR, filename)

    # write file
    with open(dest_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # attempt to import and run transcription
    try:
        # local import to avoid heavy imports at startup
        from extract import get_text

        transcription = get_text(dest_path)
    except Exception as e:
        transcription = ""
        # include error message for debugging in response
        return JSONResponse({"success": False, "error": str(e), "filename": filename})

    locked = bool(transcription and transcription.strip())

    return {"success": True, "filename": filename, "transcription": transcription, "locked": locked}


class QueryRequest(BaseModel):
    text: str


@app.post("/query")
def query_llm(req: QueryRequest):
    """Accept transcription text, call the LLM to generate SQL, run it, and return SQL + results."""
    try:
        # local import to avoid heavy deps at startup
        import main as llm_main

        sql, results = llm_main.call_llm(req.text)
        return {"success": True, "sql": sql, "results": results}
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
