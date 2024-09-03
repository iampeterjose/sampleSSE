// app/api/orders/route.js

import { NextResponse } from 'next/server';

let orders = [];
let clients = [];

const sendUpdates = () => {
    const data = JSON.stringify({
        orderCount: orders.length,
        orders: orders,
    });

    const message = `data: ${data}\n\n`;
    clients.forEach(client => {
        client.write(message);
    });
};

export async function GET(req) {
    const stream = new ReadableStream({
        start(controller) {
            const client = {
                write(message) {
                    controller.enqueue(message);
                }
            };

            clients.push(client);

            req.signal.addEventListener('abort', () => {
                clients = clients.filter(c => c !== client);
                controller.close();
            });

            // Send initial updates
            sendUpdates();

            // Simulate updates for testing
            const intervalId = setInterval(() => {
                sendUpdates();
            }, 5000); // Update every 5 seconds

            req.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
                clients = clients.filter(c => c !== client);
                controller.close();
            });
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    });
}

export async function POST(req) {
    try {
        const { item } = await req.json();
        if (!item) {
            return NextResponse.json({ error: 'Item is required' }, { status: 400 });
        }

        const newOrder = { id: orders.length + 1, item };
        orders.push(newOrder);

        sendUpdates();

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error('Error handling POST request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
