import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prima'
import bcrypt from 'bcrypt'
import {  verifyLineNotifyToken } from '../lib/linenotify'
import { handlerWrapper } from '../../handler-wrapper'
import { HttpError } from '../../customErrors'

export default handlerWrapper({
  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    const { action, username, password } = req.body
    if (action === 'login') {
       return await handleLogin(req, res)
    }
    if (action === 'register') {
      return await handleRegister(req, res)
    }
    // return res.status(400).json({ error: 'Invalid action' })
  }
}) 

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     const { action, username, password } = req.body
    

//     if (action === 'login') {
//       return await handleLogin(req, res)
//     } else if (action === 'register') {
//       return await handleRegister(req, res)
//     } else {
//       return res.status(400).json({ error: 'Invalid action' })
//     }
//   } else {
//     res.setHeader('Allow', ['POST'])
//     res.status(405).end(`Method ${req.method} Not Allowed`)
//   }
// }

async function handleLogin(req: NextApiRequest, res: NextApiResponse) {
  
    const { username, password } = req.body
    const user = await prisma.user.findUnique({ where: { username } })

    if (!user) {
      //要丟出代碼status 400錯誤給handlerWrapper
      throw new HttpError(400, 'Invalid username or password')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new HttpError(400, 'Invalid username or password')
    }

    // 檢查 LINE Notify 狀態
    let updatedLineNotifyStatus = user.lineNotifyStatus
    let message = ''
    // 如果有lineNofifyToken 驗證有無過期 NEEDS_REAUTHORIZATION NOT_SUBSCRIBED兩狀態都要重新訂閱
    if (user.lineNotifyToken) {
      const isValid = await verifyLineNotifyToken(user.lineNotifyToken)
      if (isValid) {
        updatedLineNotifyStatus = 'SUBSCRIBED'
        message= "訂閱過囉"
      }   else {
        updatedLineNotifyStatus = 'NEEDS_REAUTHORIZATION'
        message = 'Your LINE Notify subscription needs to be renewed. Please reauthorize.'
      }
    }   else {
      updatedLineNotifyStatus = 'NOT_SUBSCRIBED'
      message = 'You are not subscribed to LINE Notify. Would you like to subscribe?'
    }

    // 更新用戶的 LINE Notify 狀態
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lineNotifyStatus: updatedLineNotifyStatus },
    })

    // 不要將密碼發送回客戶端
    const { password: _, ...userWithoutPassword } = updatedUser
    console.log('response', res)
    return { user: userWithoutPassword, message }
    // res.status(200).json({ user: userWithoutPassword, message })
}


async function handleRegister(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username, password, lineNotifyStatus } = req.body
    console.log('註冊',req.body)

    // 檢查用戶名是否已存在
    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) {
      throw new HttpError(400, 'Username already exists')
    }

    // 對密碼進行加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 創建新用戶
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        lineNotifyStatus: 'NOT_SUBSCRIBED',
      },
    })
    const userId = newUser.id

    // 不要將密碼發送回客戶端 將userId發送回去
    const { id, ...userWithoutPassword } = newUser
    //userId 要放在user裡面
    const user = { ...userWithoutPassword, id: userId  }
    // return { user: id, message: 'Registration successful. You can now subscribe to LINE Notify.' }
    return { user: user,userId: userId, message: 'Registration successful. You can now subscribe to LINE Notify.' }

    // res.status(201).json({
    //   user: userWithoutPassword,
    //   message: 'Registration successful. You can now subscribe to LINE Notify.',
    // })
  } catch (error) {
    throw new HttpError(500, 'Unable to register')
    // res.status(500).json({ error: 'Unable to register' })
  }
}
