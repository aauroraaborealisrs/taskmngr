import { WebSocketServer, WebSocket } from "ws";

const clients = new Map<string, WebSocket>();

export const initializeWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket, req) => {
    const params = new URLSearchParams(req.url?.split("?")[1]);
    const userId = params.get("userId");

    if (userId) {
      clients.set(userId, ws);
      console.log(`User ${userId} connected`);

      ws.on("close", () => {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
      });
    }
  });

  return wss;
};

export const notifyUser = (userId: string, event: string, data: any) => {
    console.log('я в notifyUser');
    console.log(userId, event, data);
  const ws = clients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event, data }));
  }
};

export const broadcast = (event: string, data: any) => {
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, data }));
    }
  });
};
