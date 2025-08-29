import os
import extract
import re
import duckdb
from dotenv import load_dotenv
from rich import print
from google import genai
from google.genai.types import Content, Part


load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)

SYSTEM_PROMPT = '''
You are an Intelligent SQL Query Writer for DUCKDB. Respond only in fenced code blocks as
```sql your_sql_query ```.
User will give a simple table schema and requirement in words.
<task>
- Analyze the user request and write a meaningful SQL query based on the requirements.
</task>
'''


def call_llm(content: str):
    # build messages list
    messages = [
        SYSTEM_PROMPT,
        "Table Schema: TABLE employees (id INTEGER, name VARCHAR, position VARCHAR, salary INTEGER);",
        content,
    ],

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=messages
    )

    query_text = response.text
    sql_query = re.findall(r'```sql(.*?)```', query_text, re.DOTALL)[-1]
    print(f"[bold blue]Extracted SQL Query:\n{sql_query.strip()}[/bold blue]")

    # run query and return results
    results = run_query(sql_query.strip())
    return sql_query.strip(), results


def run_query(query: str):
    # connect to duckdb file and return results as list of dicts
    with duckdb.connect('mydb.duckdb') as conn:
        # load CSV into a DuckDB table
        conn.execute('DROP TABLE IF EXISTS employees')
        conn.execute('''
            CREATE TABLE employees AS 
            SELECT * FROM read_csv_auto('employees.csv', header=True, sep=',')
        ''')

        # run LLM query and return structured results
        cur = conn.execute(query)
        rows = cur.fetchall()
        cols = [c[0] for c in cur.description]
        results = [dict(zip(cols, row)) for row in rows]
        return results


def main():
    text = extract.get_text("./audio/audio.mp3")
    call_llm(text)

if __name__ == "__main__":
    # simple local test when running the script directly
    text = extract.get_text("./audio/audio.mp3")
    sql, results = call_llm(text)
    print(sql)
    print(results)