// messaging.ts
import amqp, { Channel } from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

const RABBIT_URL = process.env.RABBIT_URL!;
let channel: Channel;

/**
 * Connects once to RabbitMQ and returns a channel.
 * Subsequent calls return the same channel.
 */
export async function connectRabbit(): Promise<Channel> {
  if (channel) return channel;
  const conn = await amqp.connect(RABBIT_URL);
  channel = await conn.createChannel();
  return channel;
}
