# Talk2SQL — An LLM-Powered SQL Database Writer

**Talk2SQL** is an intelligent end-to-end application that enables users to interact with a database using **natural speech**.  
Simply record your voice prompt → get it transcribed → converted into a valid SQL query → executed on a DuckDB database → and view results instantly in a clean, responsive web interface.  

---

## ✨ Features

- 🎤 **Audio-to-Text**: High-speed, accurate transcription powered by [Faster Whisper](https://github.com/guillaumekln/faster-whisper).
- 🤖 **Natural Language → SQL**: [Gemini 2.5 Flash](https://ai.google.dev/) LLM converts user prompts into precise SQL queries.
- 🛠 **CRUD Operations**: Full support for Create, Read, Update, and Delete.
- 🗄 **DuckDB Integration**: Queries executed locally on a CSV-backed DuckDB instance.
- 💻 **Responsive Web Interface**: Built with **FastAPI** + **Bootstrap** for simplicity and speed.
- 🌗 **Theme Support**: Toggle between Light and Dark mode.

---

## 📂 Project Structure

autoSQL/
├── app.py                # FastAPI backend server
├── main.py               # LLM → SQL → DuckDB logic
├── extract.py            # Faster Whisper transcription
├── employees.csv         # Sample dataset
├── audio/                # User-uploaded audio files (gitignored)
├── static/               # Frontend JS and CSS
│   ├── main.js
│   └── styles.css
├── templates/            # Jinja2 HTML templates
│   └── index.html
├── .env                  # Local environment variables
├── .env.example          # Example template for environment variables
├── .gitignore
└── requirements.txt

---

## ⚙️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/LLM-SQL-Writer.git
   cd LLM-SQL-Writer ```


2. **Create a virtual environment**

   ```bash
   uv venv
   source .venv/bin/activate   # Linux / Mac
   .venv\Scripts\activate      # Windows PowerShell
   ```

3. **Install dependencies**

   ```bash
   uv pip install -r requirements.txt
   ```

4. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

5. **Add your Google API key to `.env`**:

   ```ini
   GOOGLE_API_KEY="your_api_key_here"
   ```

---

6. **Running the Application**

Start the FastAPI server:

```bash
uvicorn app:app --reload
```

Then open your browser at 👉 [http://127.0.0.1:8000](http://127.0.0.1:8000)

You can now record audio, generate SQL queries, and view results in real-time.

---

## 📝 Usage Workflow

1. 🎙 **Record Audio** → Click *Start Recording*, speak your request, then *Stop*.
2. 📤 **Upload** → Send the audio to the backend.
3. ✍️ **Transcription** → Your spoken request is transcribed into text.
4. 🔎 **Generate SQL** → LLM generates SQL from your natural language query.
5. 📊 **View Results** → DuckDB executes the query and displays results in a table.

---

## ⚠️ Notes

* Only audio with valid transcription will be accepted as prompts.
* Uploaded files are stored in the `audio/` directory (ignored by Git).
* The included `employees.csv` dataset is required for testing.

---

## 📦 Dependencies

* [FastAPI](https://fastapi.tiangolo.com/)
* [Uvicorn](https://www.uvicorn.org/)
* [Faster Whisper](https://github.com/guillaumekln/faster-whisper)
* [DuckDB](https://duckdb.org/)
* [python-dotenv](https://pypi.org/project/python-dotenv/)
* [Rich](https://github.com/willmcgugan/rich)
* [Google GenAI](https://developers.generativeai.google/)
* [Jinja2](https://palletsprojects.com/p/jinja/)

---

## 📜 License

**MIT License** © 2025 [Saketh Nandula](https://github.com/saketh0104)

---

🚀 Enjoy your voice-driven SQL experience with **Talk2SQL**!
