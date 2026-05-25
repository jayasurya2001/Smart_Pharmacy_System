import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from typing import List

router = APIRouter(prefix="/api/stream", tags=["stream"])

clients: List[asyncio.Queue] = []

async def notify_clients(message: str):
    for queue in clients:
        await queue.put(message)

@router.get("")
async def sse_stream():
    queue = asyncio.Queue()
    clients.append(queue)
    
    async def event_generator():
        try:
            while True:
                message = await queue.get()
                yield f"data: {message}\n\n"
        except asyncio.CancelledError:
            clients.remove(queue)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
