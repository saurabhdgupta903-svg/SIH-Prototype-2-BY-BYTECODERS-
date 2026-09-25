import asyncio
import json
import logging
from typing import Dict, Set, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Live Telemetry & Tracking"])

class ConnectionManager:
    """Manages active WebSocket connections for driver tracking and IoT sensors."""
    def __init__(self):
        self.tracking_connections: Set[WebSocket] = set()
        self.sensor_connections: Set[WebSocket] = set()
        # Simulated driver state
        self.driver_location = {
            "lat": 18.5204,
            "lng": 73.8567,
            "heading": 45.0,
            "speed_kmh": 24.5,
            "status": "in_transit",
            "eta_minutes": 14.0,
            "current_stop": "Annapoorna Community Kitchen"
        }

    async def connect_tracking(self, websocket: WebSocket):
        await websocket.accept()
        self.tracking_connections.add(websocket)
        # Send initial driver location
        await websocket.send_text(json.dumps({
            "type": "DRIVER_LOCATION",
            "data": self.driver_location
        }))

    def disconnect_tracking(self, websocket: WebSocket):
        self.tracking_connections.discard(websocket)

    async def broadcast_tracking(self, message: dict):
        dead_conns = set()
        for conn in self.tracking_connections:
            try:
                await conn.send_text(json.dumps(message))
            except Exception:
                dead_conns.add(conn)
        for d in dead_conns:
            self.tracking_connections.discard(d)

    async def connect_sensor(self, websocket: WebSocket):
        await websocket.accept()
        self.sensor_connections.add(websocket)

    def disconnect_sensor(self, websocket: WebSocket):
        self.sensor_connections.discard(websocket)

    async def broadcast_sensor(self, message: dict):
        dead_conns = set()
        for conn in self.sensor_connections:
            try:
                await conn.send_text(json.dumps(message))
            except Exception:
                dead_conns.add(conn)
        for d in dead_conns:
            self.sensor_connections.discard(d)

ws_manager = ConnectionManager()

@router.websocket("/ws/driver-tracking")
async def driver_tracking_ws(websocket: WebSocket):
    """
    WebSocket endpoint for real-time driver GPS tracking.
    Supports receiving phone GPS via watchPosition and broadcasting to connected clients.
    Includes a 25-second ping keepalive to prevent Render reverse proxy timeouts.
    """
    await ws_manager.connect_tracking(websocket)

    async def ping_keepalive():
        try:
            while True:
                await asyncio.sleep(25.0)
                await websocket.send_text(json.dumps({"type": "PING"}))
        except Exception:
            pass

    ping_task = asyncio.create_task(ping_keepalive())

    try:
        while True:
            text = await websocket.receive_text()
            data = json.loads(text)
            msg_type = data.get("type")

            if msg_type == "PONG":
                continue

            elif msg_type == "UPDATE_LOCATION":
                # Real GPS from driver phone
                loc = data.get("data", {})
                ws_manager.driver_location.update(loc)
                await ws_manager.broadcast_tracking({
                    "type": "DRIVER_LOCATION",
                    "data": ws_manager.driver_location,
                    "is_simulated": False
                })

            elif msg_type == "SIMULATE_STEP":
                # Simulated step along OSRM route polyline
                loc = data.get("data", {})
                ws_manager.driver_location.update(loc)
                await ws_manager.broadcast_tracking({
                    "type": "DRIVER_LOCATION",
                    "data": ws_manager.driver_location,
                    "is_simulated": True
                })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket tracking error: {e}")
    finally:
        ping_task.cancel()
        ws_manager.disconnect_tracking(websocket)

@router.websocket("/ws/storage-sensors")
async def storage_sensors_ws(websocket: WebSocket):
    """
    WebSocket endpoint broadcasting real-time cold storage IoT sensor updates.
    Posts temperature, humidity, door status, and anomaly flags every few seconds.
    Labelled 'Simulated data'.
    """
    await ws_manager.connect_sensor(websocket)
    temp_sequence = [4.8, 5.2, 5.9, 6.8, 7.8, 8.4, 9.6, 11.2, 10.8, 9.5, 7.2, 5.0]
    idx = 0
    try:
        while True:
            curr_temp = temp_sequence[idx % len(temp_sequence)]
            is_anomaly = curr_temp > 8.0
            anomaly_msg = f"Potential storage issue detected: temperature ({curr_temp}°C) exceeds 8.0°C safety threshold" if is_anomaly else None

            payload = {
                "type": "SENSOR_TELEMETRY",
                "data": {
                    "location": "Cold Storage Room A",
                    "temperature_c": curr_temp,
                    "humidity_pct": round(82.0 + (curr_temp * 0.5), 1),
                    "door_status": "open" if is_anomaly and idx % 4 == 0 else "closed",
                    "power_draw_kw": round(18.5 + (curr_temp * 0.4), 1),
                    "is_anomaly": is_anomaly,
                    "anomaly_message": anomaly_msg,
                    "label": "Simulated data"
                }
            }
            await websocket.send_text(json.dumps(payload))
            idx += 1
            await asyncio.sleep(4.0)

    except WebSocketDisconnect:
        ws_manager.disconnect_sensor(websocket)
    except Exception:
        ws_manager.disconnect_sensor(websocket)
