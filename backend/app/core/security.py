import base64
import hashlib
from cryptography.fernet import Fernet
from app.core.config import settings

class SecureVault:
    def __init__(self, key: str = None):
        if not key:
            key = settings.SECRET_VAULT_KEY
        
        # Fernet requires a 32-byte url-safe base64 key.
        # We derive it from our secret vault key to guarantee length and compatibility.
        derived_key = hashlib.sha256(key.encode()).digest()
        fernet_key = base64.urlsafe_b64encode(derived_key)
        self.cipher = Fernet(fernet_key)

    def encrypt(self, plain_text: str) -> str:
        """Encrypts sensitive plain text string to encrypted cipher string."""
        if not plain_text:
            return ""
        return self.cipher.encrypt(plain_text.encode()).decode()

    def decrypt(self, cipher_text: str) -> str:
        """Decrypts encrypted cipher string back to original plain text."""
        if not cipher_text:
            return ""
        try:
            return self.cipher.decrypt(cipher_text.encode()).decode()
        except Exception:
            # Fallback in case of key mismatch during local debugging
            return "decryption_failed_invalid_key"

# Instantiate shared vault
vault = SecureVault()
