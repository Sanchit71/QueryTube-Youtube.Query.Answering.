import re
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from nltk.tokenize import word_tokenize
from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow all origins during development, update as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryInfo(BaseModel):
    video_id: str
    query: str

@app.post("/get_answer")
async def get_answer(info: QueryInfo):
    try:
        # Get YouTube transcript
        srt = YouTubeTranscriptApi.get_transcript(info.video_id)
        
        # Extract text from transcript
        para = [caption['text'] for caption in srt]
        
        # Preprocess captions
        processed_captions = preprocess_captions(para)
        
        # Join processed captions into a single string
        text_ = ' '.join(processed_captions)
        
        # Perform question-answering
        query = info.query
        answer = await get_answer_from_model(query, text_)
        
        return {"answer": answer}

    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        print(error_msg)  # Log the error to the console for debugging
        raise HTTPException(status_code=500, detail=error_msg)

def preprocess_captions(captions):
    processed_captions = []

    for caption in captions:
        words = word_tokenize(caption.lower())
        words = [re.sub(r'[^a-zA-Z0-9]', '', word) for word in words]
        words = [word for word in words if word != '']
        processed_caption = ' '.join(words)
        processed_captions.append(processed_caption)

    return processed_captions

async def get_answer_from_model(query, text):
    model_name = "deepset/roberta-base-squad2"
    model = AutoModelForQuestionAnswering.from_pretrained(model_name)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    nlp = pipeline('question-answering', model=model, tokenizer=tokenizer, framework='pt', min_answer_length=10)

    QA_input = {'question': query, 'context': text}
    
    # Use asyncio to await the result
    loop = asyncio.get_event_loop()
    res = await loop.run_in_executor(None, lambda: nlp(QA_input))

    return res['answer']
