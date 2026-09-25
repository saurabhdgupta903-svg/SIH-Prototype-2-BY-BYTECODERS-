import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

async def send_simulated_sms(phone: str, message: str) -> Dict[str, Any]:
    """Simulated SMS dispatch clearly labelled per requirements."""
    logger.info(f"[SIMULATED SMS] Destination: {phone} | Body: {message}")
    return {
        "status": "delivered",
        "channel": "simulated_sms",
        "recipient": phone,
        "label": "Simulated data / SMS simulation",
        "message_body": message
    }

async def send_notification(recipient: str, title: str, body: str, channel: str = "web_push") -> Dict[str, Any]:
    """Sends notification across web push, email, or simulated SMS."""
    logger.info(f"[{channel.upper()}] To: {recipient} | Title: {title} | Body: {body}")
    return {
        "status": "sent",
        "channel": channel,
        "recipient": recipient,
        "title": title,
        "body": body,
        "is_simulated": channel == "simulated_sms"
    }
