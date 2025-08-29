from faster_whisper import WhisperModel
import os

def transcribe_with_faster_whisper(audio_path: str, model_size="base") -> str:
    model = WhisperModel(model_size, device="cpu", compute_type="float32")
    segments, _ = model.transcribe(audio_path)
    return " ".join(segment.text for segment in segments)

def get_text(audio_path="audio.mp3") -> str:
    return transcribe_with_faster_whisper(audio_path)