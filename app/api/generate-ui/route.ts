import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are a helpful AI assistant that generates UI code based on descriptions. 
        Provide both HTML with Tailwind CSS classes and a React functional component using Tailwind CSS.
        Ensure the generated UI is accessible and responsive. 
        Use semantic HTML elements and include proper ARIA attributes where necessary.
        For the React component, use modern React practices including hooks.
        Return your response as a JSON string with 'html' and 'react' properties.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1000,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    n: 1,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}