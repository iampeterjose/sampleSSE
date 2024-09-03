// app/api/orders/route.js

let orders = [];

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

    // Create a new readable stream for SSE
    const stream = new ReadableStream({
        start(controller) {
            const sendEvent = (data) => {
                controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            };

            // Send initial data
            sendEvent({ orderCount: orders.length, orders });

            // Send updates every 5 seconds
            const intervalId = setInterval(() => {
                sendEvent({ orderCount: orders.length, orders });
            }, 5000);

            // Handle stream closure
            req.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
                controller.close();
            });
        }
    });

    return new Response(stream, { headers });
}
