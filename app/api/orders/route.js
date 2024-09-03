import { NextResponse } from 'next/server';

let orders = [];

const createSSEMessage = (data) => {
    return `data: ${JSON.stringify(data)}\n\n`;
};

const sendUpdates = (controller) => {
    const data = {
        orderCount: orders.length,
        orders,
    };

    const message = createSSEMessage(data);
    controller.enqueue(message);
};

export async function GET(req) {
    const stream = new ReadableStream({
        start(controller) {
            sendUpdates(controller);

            const intervalId = setInterval(() => sendUpdates(controller), 5000);

            req.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
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

        return NextResponse.json(newOrder);
    } catch (error) {
        console.error('Error handling POST request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
