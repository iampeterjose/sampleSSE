// app/api/orders/route.js

let orders = []; // This will store orders temporarily. Use a database in production.

export async function POST(req) {
    const { item } = await req.json();
    const newOrder = { id: orders.length + 1, item };
    orders.push(newOrder);

    return new Response(JSON.stringify(newOrder), { status: 201 });
}

export async function GET(req) {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    };

    // Create a promise that resolves when the stream is closed
    const streamClosed = new Promise(resolve => {
        req.signal.addEventListener('abort', () => {
            resolve();
        });
    });

    // Create a readable stream
    const stream = new ReadableStream({
        start(controller) {
            // Function to send data
            const sendEvent = (data) => {
                controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            };

            // Send initial orders and order count
            sendEvent({ orderCount: orders.length, orders });

            // Example: Update every 5 seconds (adjust as necessary)
            const intervalId = setInterval(() => {
                sendEvent({ orderCount: orders.length, orders });
            }, 5000);

            // Clean up on stream close
            streamClosed.then(() => {
                clearInterval(intervalId);
                controller.close();
            });
        }
    });

    return new Response(stream, { headers });
}
