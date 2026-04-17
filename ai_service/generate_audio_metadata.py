import os
import json
import time
import requests
import mimetypes
from pathlib import Path
from tqdm import tqdm
from mutagen import File as MutagenFile

# Configuration constants based on the user's curl requests
TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJwZXJtaXNzaW9ucyI6W10sImZ1bGxuYW1lIjoiUml5YSAiLCJ1c2VyIjoiYzE1MTI5MGMtMDRmMi00MTM4LWFkNGMtNTQyZjYwM2ZlZWY0IiwiZW1haWwiOiJyaXlhQHZpZHlheWF0YW4uY29tIiwiaXNfcm9vdF91c2VyIjp0cnVlLCJhdXRob3JpdGllcyI6eyI2YjYwMDk0MC0yMTM0LTQwZWMtOTNlZC1iNjFlNDAzYzVhODciOnsicGVybWlzc2lvbnMiOlsiUkVBRCIsIldSSVRFIl0sInJvbGVzIjpbIkFETUlOIl19fSwidXNlcm5hbWUiOiJyaXlhX2phaW4iLCJzdWIiOiJyaXlhX2phaW4iLCJpYXQiOjE3NzYxNzcxNTQsImV4cCI6MTc3ODc2OTE1NH0.9TnqWz5z57eFanTCX3Wwk_76Vsl1KRgfnJGPJNT9P5c"

SIGNED_URL_ENDPOINT = "https://backend-stage.vacademy.io/media-service/public/get-signed-url"
PUBLIC_URL_ENDPOINT = "https://backend-stage.vacademy.io/media-service/get-public-url"

SOURCE = "6b600940-2134-40ec-93ed-b61e403c5a87"
SOURCE_ID = "STUDENTS"

COMMON_HEADERS = {
    "accept": "application/json, text/plain, */*",
    "origin": "https://dash.vacademy.io",
    "referer": "https://dash.vacademy.io/",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36"
}

def get_audio_duration(file_path):
    try:
        audio = MutagenFile(file_path)
        if audio and audio.info and hasattr(audio.info, 'length'):
            return round(audio.info.length, 2)
    except Exception as e:
        print(f"Failed to get duration for {file_path}: {e}")
    return 0.0

def get_signed_url(file_name, file_type):
    headers = COMMON_HEADERS.copy()
    headers.update({"content-type": "application/json"})
    payload = {
        "file_name": file_name,
        "file_type": file_type,
        "source": SOURCE,
        "source_id": SOURCE_ID
    }
    resp = requests.post(SIGNED_URL_ENDPOINT, headers=headers, json=payload)
    resp.raise_for_status()
    try:
        return resp.json()
    except Exception as e:
        print(f"Failed to parse JSON for get-signed-url. Resp text: {resp.text}")
        raise e

def upload_to_s3(signed_url, file_path, file_type):
    with open(file_path, "rb") as f:
        file_data = f.read()
    
    headers = COMMON_HEADERS.copy()
    headers.update({
        "Content-Type": file_type,
        "Content-Length": str(len(file_data)),
        "Origin": "https://dash.vacademy.io", # Duplicate but explicitly matching curl
        "Referer": "https://dash.vacademy.io/"
    })
    # Remove some headers if necessary, but requests does fine
    # Note: Using requests.put
    resp = requests.put(signed_url, headers=headers, data=file_data)
    resp.raise_for_status()

def get_public_url(file_id):
    headers = COMMON_HEADERS.copy()
    headers.update({
        "authorization": f"Bearer {TOKEN}"
    })
    params = {
        "fileId": file_id,
        "expiryDays": "1" # User prompt showed expiryDays=1, even for public URLs, checking if that's standard
    }
    resp = requests.get(PUBLIC_URL_ENDPOINT, headers=headers, params=params)
    resp.raise_for_status()
    return resp.text.strip(' \n"')

def main():
    sounds_dir = Path("sounds")
    output_file = Path("sounds_metadata.json")
    
    # Load existing metadata progress if it exists to resume
    metadata_list = []
    processed_paths = set()
    if output_file.exists():
        with open(output_file, "r") as f:
            metadata_list = json.load(f)
            processed_paths = {item["local_path"] for item in metadata_list}
    
    # Find all audio files
    audio_files = []
    supported_exts = {".mp3", ".wav", ".aac", ".ogg", ".m4a"}
    for path in sounds_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in supported_exts:
            audio_files.append(path)
            
    print(f"Found {len(audio_files)} audio files.")
    
    files_to_process = [p for p in audio_files if str(p) not in processed_paths]
    print(f"Files remaining to process: {len(files_to_process)}")
    
    # Process only 10 files if we are running in TEST mode
    # For now, we will just use a hardcoded flag
    TEST_MODE = False
    if TEST_MODE:
        files_to_process = files_to_process[:10]
        print("Running in TEST_MODE. Processing 10 files.")

    for path in tqdm(files_to_process, desc="Uploading and processing"):
        try:
            file_name = path.name
            file_ext = path.suffix.lower()
            file_type = mimetypes.types_map.get(file_ext, "application/octet-stream")
            if file_type == "audio/x-wav":
                file_type = "audio/wav"
                
            # Infer descriptive info
            category = path.parent.name
            clean_name = path.stem.replace("_", " ").replace("-", " ")
            description = f"{category} - {clean_name}"
            
            # 1. duration & ID3 tags logic
            duration_val = 0.0
            id_desc = ""
            try:
                audio = MutagenFile(path)
                if audio and audio.info and hasattr(audio.info, 'length'):
                    duration_val = round(audio.info.length, 2)
                if audio and audio.tags:
                    # check for COMM tags or similar
                    for k, v in audio.tags.items():
                        if "COMM" in k and hasattr(v, 'text') and v.text:
                            id_desc = str(v.text[0]).replace('"', '')
                            break
            except Exception as e:
                pass
                
            if id_desc:
                description = f"{category} - {id_desc}"
            else:
                description = f"{category} - {clean_name}"
            
            # 2. Get signed url
            signed_data = get_signed_url(file_name, file_type)
            file_id = signed_data["id"]
            upload_url = signed_data["url"]
            
            # 3. Upload to s3
            upload_to_s3(upload_url, path, file_type)
            
            # Wait 10 seconds as requested
            time.sleep(1)
            
            # 4. Get public URL
            public_url = get_public_url(file_id)
            
            # Save metadata
            meta_item = {
                "local_path": str(path),
                "file_id": file_id,
                "file_name": file_name,
                "category": category,
                "description": description,
                "duration_seconds": duration_val,
                "public_url": public_url
            }
            metadata_list.append(meta_item)
            
            # Atomic write to ensure idempotency is never corrupted by sudden crashes
            temp_file = output_file.with_name(output_file.name + ".tmp")
            with open(temp_file, "w") as f:
                json.dump(metadata_list, f, indent=4)
            temp_file.replace(output_file)
                
        except requests.exceptions.HTTPError as e:
            print(f"\nHTTP Error processing {path}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response text: {e.response.text}")
            continue
        except Exception as e:
            print(f"\nError processing {path}: {e}")
            continue

if __name__ == "__main__":
    main()
