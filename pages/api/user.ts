import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prima'
import { handlerWrapper } from '../../handler-wrapper'


export default handlerWrapper({
  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    const { username, password, lineNotifyToken, preferences } = req.body
    const user = await prisma.user.create({
      data: {
        username,
        password,
        lineNotifyToken,
        preferences: {
          create: preferences,
        },  
      },
      include: {
        preferences: true,
      },
    })
    res.status(201).json(user)
  },
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    const users = await prisma.user.findMany({
      include: {
        preferences: true,
      },
    })
    res.status(200).json(users)
  },
})
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     // 創建新用户
//     try {
//       const { username, password,lineNotifyToken, preferences } = req.body
//       const user = await prisma.user.create({
//         data: {
//           username,
//           password,
//           lineNotifyToken,
//           preferences: {
//             create: preferences,
//           },
//         },
//         include: {
//           preferences: true,
//         },
//       })
//       res.status(201).json(user)
//     } catch (error) {
//       res.status(500).json({ error: 'Unable to create user' })
//     }
//   } else if (req.method === 'GET') {
//     // 獲取所有用户
//     try {
//       const users = await prisma.user.findMany({
//         include: {
//           preferences: true,
//         },
//       })
//       res.status(200).json(users)
//     } catch (error) {
//       res.status(500).json({ error: 'Unable to fetch users' })
//     }
//   } else {
//     res.setHeader('Allow', ['POST', 'GET'])
//     res.status(405).end(`Method ${req.method} Not Allowed`)
//   }
// }
