# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from openai import OpenAI
from scraper import scrape_website  # Make sure this file exists

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "Authorization": f"Bearer {api_key}",
    }
)
print("LOADED API KEY:", api_key)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    url: str

def chunk_text(text, chunk_size=1000):
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

def summarize_chunk(chunk):
    try:
        response = client.chat.completions.create(
            model="openai/gpt-4o",
            messages=[
                {"role": "system", "content": "Summarize the following text."},
                {"role": "user", "content": chunk}
            ],
            max_tokens=300,
            extra_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "WebQA Assistant",
            }
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error summarizing chunk: {e}"

@app.post("/ask/")
async def ask(query: QueryRequest):
    full_text = scrape_website(query.url)
    if full_text.startswith("Error"):
        return {"error": full_text}

    chunks = chunk_text(full_text)
    summaries = []

    for chunk in chunks[:5]:
        summary = summarize_chunk(chunk)
        if summary.startswith("Error"):
            return {"error": summary}
        summaries.append(summary)

    combined_summary = "\n".join(summaries)

    prompt = f"""
    Based on this summarized content from the website:\n\n{combined_summary}\n\n
    Answer the following question:\n\n{query.question}
    """

    try:
        final_response = client.chat.completions.create(
            model="deepseek/deepseek-chat-v3-0324:free",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            extra_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "WebQA Assistant",
            }
        )
        return {"answer": final_response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
