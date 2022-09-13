import os
from dotenv import load_dotenv
import json

load_dotenv(".env")
credentials = json.loads(os.environ.get("SERVICE_ACCOUNT"))
