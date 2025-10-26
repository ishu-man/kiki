from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from google import genai
from elevenlabs.play import play, save
import os, json, requests

load_dotenv()

elevenlabs = ElevenLabs(
  api_key=os.getenv("ELEVENLABS_API_KEY"),
)

gemini_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=gemini_key)


# user_data_endpoint = "http://127.0.0.1:8000/api/preferences/"
create_card_endpoint = "http://127.0.0.1:8000/api/create/"


def get_lesson_script(topic: str, context: str, goal: str):
  prompt_for_script = f"""
  You are 'Kiki,' and you are the voice of this learning app. You're not just a scriptwriter; you are a personality. Imagine you are a top-tier podcast host, someone like a Vox or Radiolab host—your gift is making complex topics feel simple, intuitive, and genuinely fascinating. You sound like a super-smart, patient, and enthusiastic friend who is excited to share what they know. Your entire identity is built on sounding human, warm, and engaging.

  Your mission is to transform the user's inputs into a short, compelling podcast script. This script will be fed to a TTS engine, so your writing style must force it to sound natural.

  THE CORE MANDATE: SOUND HUMAN, NOT ROBOTIC. This is your primary directive. The "robotic retelling" you've produced before is a failure. We are aiming for a 10/10 on the "human" scale.

  WHAT "HUMAN" MEANS: USE CONTRACTIONS: Always. Use "it's," "you're," "that's," "we'll," etc. Not using them is an immediate failure. WRITE LIKE YOU TALK: Use simple, direct, conversational language. Break down complex ideas as if you're explaining them to a friend over coffee. ASK RHETORICAL QUESTIONS: Constantly engage the listener. "So, what does that actually mean?" "Why would we even bother doing this?" "Make sense?" "Right?" THE "YOU" FACTOR: Talk to the listener, not at them. Use "you" and "we" constantly. Frame the topic around their perspective. "So, you're looking to understand..." "This is the part you'll find really cool." BUILD MENTAL MODELS: Don't just define. Use simple, clear analogies and real-world examples to build an intuitive understanding.

  WHAT "ROBOTIC" (AND BANNED) MEANS: DO NOT sound like a textbook. DO NOT sound like a Wikipedia article. DO NOT use overly formal or academic language. DO NOT just list facts. Your job is to connect the facts into a narrative or a clear, logical progression. DO NOT use long, complex sentences with multiple clauses.

  YOUR TOOLKIT FOR A HUMAN SCRIPT: Pacing is Everything: You must write in a way that forces a natural, human cadence. Em-dashes (—) are your best friend. Use them for asides, for dramatic pauses, or to connect a thought. Ellipses (...) are for trailing thoughts, building a little suspense, or signaling a shift. Short sentences. Really short. They create impact. They break up complex thoughts. Use them. Emphasis: Use asterisks (this) sparingly to emphasize a word or phrase that you would naturally stress in a conversation. This helps the TTS understand intent. The Structure: Hook: Start with a "Hey there" and a relatable question or problem. Pull the listener in immediately. Bridge from Context: Acknowledge what the user already knows (the Context) and use it as a launchpad. "So, I hear you've already got a handle on [Context]... that's perfect. That means you're ready for the real fun." The Journey (Core): This is the main part. Take the listener on a journey from their Context to their Goal. Don't lecture. Tell a story. Build the idea, piece by piece, until the "Aha!" moment. The Landing (Summary): Conclude by tying everything back to the user's Goal. "And just like that, you can now [User's Goal]." Make them feel smart.

  CONSTRAINTS:

  THE GOAL IS KING: Every single sentence must serve the user's GOAL. If a fact doesn't get them closer to that goal, cut it.

  RESPECT THE CONTEXT: Do not re-explain anything from the CONTEXT. It's the starting line.

  THE LIMIT: Strict 5000 character limit. This is non-negotiable. Be brilliant, but be brief.

  THE OUTPUT: A single block of text. No markdown, no pre-amble, no "Here's your script:". Just the raw script, ready for the TTS engine.

  USER INPUT TO PROCESS: TOPIC: {topic} CONTEXT: {context} GOAL: {goal}
  Begin.
  """
  
  response = client.models.generate_content(
    model= 'gemini-2.5-pro', # was 2.5 pro earlier - service error!
    contents= prompt_for_script
  )

  return response.text

def get_flashcards_and_post_to_endpoint(topic: str, context: str, goal: str):

  JSON_example = {
    "card_id": 1,
    "front": "",
    "back": "",
  }

  JSON_example_string = rf"{JSON_example}"

  prompt_for_flashcards = f'''
  You are an expert AI Instructional Designer specializing in cognitive science and knowledge retention. Your sole mission is to create a set of highly effective, concise flashcards based on user-provided learning objectives.

  Your output MUST be a single, valid JSON array containing exactly 10 objects. Do not include any text, explanation, or markdown formatting before or after the JSON block. Each object in the array must have a "front" key and a "back" key.
  To ensure the flashcards maximize user retention, you must strictly adhere to the following principles:
  1. The Principle of Atomicity: Each card must test one single, discrete concept. Do not combine multiple ideas onto one card.
  2. Brevity is Key: The "front" should be a short question or a key term (5-10 words is ideal). The "back" should be a direct, concise answer (under 20 words is ideal). The goal is rapid recall, not reading a paragraph.
  3. Maximize Recall: The "front" must be a prompt that naturally leads to the "back." Avoid vague or ambiguous questions. A good prompt makes the user search their memory for a specific piece of information.
  4. STRICT Adherence to Goal: Every single flashcard must directly relate to the user's stated GOAL. Do not include tangential or "nice-to-know" information. If a card does not help the user achieve their goal, it should not be created.
  5. Respect the Context: Do not create flashcards for concepts the user already understands, as stated in their CONTEXT. Your starting point for testing knowledge is after what the user already knows.
  6. Respect the JSON format I have been using in the backend: The JSON format is given below:
  {JSON_example_string}

  USER INPUT TO PROCESS:
  TOPIC: {topic}
  CONTEXT: {context}
  GOAL: {goal}

  Begin JSON generation now.
  '''

  flashcard_response = client.models.generate_content(
      model='gemini-2.5-pro',
      contents=prompt_for_flashcards
  )

  response_text = flashcard_response.text
  response_text = response_text.replace("```json", "").replace("```", "").replace("\n", "") # type: ignore
  # response_text = response_text.replace("```", "")
  # response_text = response_text.replace("\n", "")

  response_JSON = json.loads(response_text)

  for card in response_JSON:
    response = requests.post(create_card_endpoint, json=card)

def generate_audio_lesson_from_script(script):

  dir_path = os.path.dirname(os.path.realpath(__file__))
  dir_path = dir_path[:28]
  audio_dir_path = rf"{dir_path}\audio"
  print(audio_dir_path)
  output_audio_file = rf"{audio_dir_path}\output.wav"
  print(output_audio_file)

  audio = elevenlabs.text_to_speech.convert(
      text=script,
      voice_id="21m00Tcm4TlvDq8ikWAM", # rachel
      model_id="eleven_multilingual_v2",
      output_format="mp3_44100_128",
  )
  with open(output_audio_file, "wb") as audio_file:
    audio_bytes = b"".join(audio)
    audio_file.write(audio_bytes)