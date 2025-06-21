import {Request, Response, NextFunction} from 'express';
import {redis} from '../cache';

export function cache(ttlSeconds: number) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const key = `${req.method}:${req.originalUrl}`;
        try{
            const cached = await redis.get(key);
            if(cached) {
                console.log(`[CACHE HIT] ${key}`);
                return res.json(JSON.parse(cached));
            }
        } catch (err) {
            console.error('Cache read error', err)
        }
        // hijack res.json to cache after sending
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
            redis
            .setEx(key, ttlSeconds, JSON.stringify(body))
            .catch(err => console.error('Cache write error', err));
        console.log(`[CACHE MISS] ${key}`);
        return originalJson(body)
        };

        next();
    }
}