# LLM SQL Writer

**LLM SQL Writer** is an end-to-end intelligent application that allows users to interact with a database using **natural speech**. Users can record audio prompts, which are transcribed and converted into SQL queries by a large language model. The SQL is executed on a DuckDB database, and results are displayed in a clean, responsive web interface.

---

## Features

- **Audio-to-Text**: Uses [Faster Whisper](https://github.com/guillaumekln/faster-whisper) for high-speed and accurate transcription.
- **Natural Language to SQL**: Gemini 2.5 Flash LLM converts user prompts into precise SQL queries.
- **CRUD Operations**: Supports Create, Read, Update, Delete operations on your database.
- **DuckDB Integration**: Executes SQL queries locally on a CSV-backed database.
- **Responsive Web Interface**: Built with FastAPI and Bootstrap for a clean frontend.
- **Theme Support**: Light and Dark mode toggle.

---

## Project Structure

```

autoSQL/
├── app.py                # FastAPI backend
├── main.py               # LLM → SQL → DuckDB logic
├── extract.py            # Faster Whisper transcription
├── employees.csv         # Sample dataset
├── audio/                # User-uploaded audio files (gitignored)
├── static/               # Frontend JS and CSS
│   ├── main.js
│   └── styles.css
├── templates/            # HTML templates
│   └── index.html
├── .env                  # Secrets (local only)
├── .env.example          # Template for environment variables
├── .gitignore
└── requirements.txt

````

---

## Setup & Installation

1. **Clone the repository:**

```bash
git clone https://github.com/<your-username>/LLM-SQL-Writer.git
cd LLM-SQL-Writer
````

2. **Create a virtual environment:**

```bash
uv venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate      # Windows PowerShell
```

3. **Install dependencies:**

```bash
uv pip install -r requirements.txt
```

4. **Set up environment variables:**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your Google API key in `.env`:

```ini
GOOGLE_API_KEY="your_api_key_here"
```

---

## Running the Application

Start the FastAPI server:

```bash
uvicorn app:app --reload
```

* Open your browser at: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Record audio, submit your prompt, and see SQL and query results in real-time.

---

## Usage

1. **Record Audio**: Click *Start Recording*, speak your request, then *Stop*.
2. **Upload**: Click *Upload* to send audio to the backend.
3. **View Transcription**: The transcription will appear and lock the prompt if valid.
4. **Generate SQL**: The LLM generates SQL based on your prompt.
5. **View Results**: DuckDB executes the query and shows results in a table.

---

## Notes

* Only audio files with transcribable content will lock the user prompt.
* All uploaded audio is stored in the `audio/` folder (ignored by Git).
* Ensure `employees.csv` is present for testing SQL queries.

---

## Dependencies

* [FastAPI](https://fastapi.tiangolo.com/)
* [Uvicorn](https://www.uvicorn.org/)
* [Faster Whisper](https://github.com/guillaumekln/faster-whisper)
* [DuckDB](https://duckdb.org/)
* [python-dotenv](https://pypi.org/project/python-dotenv/)
* [Rich](https://github.com/willmcgugan/rich)
* [Google GenAI](https://developers.generativeai.google/)
* [Jinja2](https://palletsprojects.com/p/jinja/)

---

## License

MIT License © 2025 Saketh Nandula

---

Enjoy your voice-driven SQL application! 🚀

```

This is **all-in-one copyable Markdown** — ready to drop into your repo as `README.md`.  

If you want, I can also give you a **ready-to-copy `requirements.txt`** for this cleaned project next. Do you want me to do that?
```
