import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { HttpError } from './customErrors';
type Method = 'POST' | 'GET' | 'PUT' | 'DELETE';

export const handlerWrapper = (handlerMap: Partial<Record<Method, NextApiHandler>>) => async (req: NextApiRequest, res: NextApiResponse) => {
  const handler = handlerMap[req.method as Method];
  if (!handler) {
    res.status(405).json({
      message: 'Unsupported method'
    });
    return;
  }
  try {
    const result = await handler(req, res);
    console.log('result', result)
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    if (e instanceof HttpError) {
      res.status(e.statusCode).json({ message: e.message });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};