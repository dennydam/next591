import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { region, sectionid, minPrice,maxPrice, userId } = req.body;
    console.log('req.body1111111111',req.body)
    // 假設我們可以從 session 或 token 中獲取用戶 ID
    // 這裡為了示例，我們使用一個固定的用戶 ID
    // const userId = 1;

    const updatedPreference = await prisma.preference.upsert({
      where: { userId: userId },
      update: {
        region,
        sectionid,
        minPrice,
        maxPrice,
      },
      create: {
        userId,
        region,
        sectionid,
        minPrice,
        maxPrice
      },
    });

    res.status(200).json(updatedPreference);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Error updating preferences' });
  } finally {
    await prisma.$disconnect();
  }
}