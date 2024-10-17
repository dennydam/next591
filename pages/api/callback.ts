import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import jwtDecode from 'jwt-decode'
import { getLineNotifyToken } from '../lib/linenotify'
import axios from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getLineUserInfo(accessToken: string) {
  try {
    const response = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching Line user info:', error)
    throw error
  }
}



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const  { code,state } = req.query
      const  userId = state as string
      console.log('code',code)
      console.log('state',state)
      const users = await prisma.user.findMany()
      console.log('users',users)
      const token = await getLineNotifyToken(code as string)
      
      // const res = await getLineUserInfo(token)
      // console.log('userInfor',res)
      // console.log('token',token)
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          lineNotifyToken: token,
          lineNotifyStatus: 'SUBSCRIBED',
        },
      })
      console.log('updateUSer', updatedUser)
      // await saveUserSettings({
      //   userId,
      //   lineNotifyToken: token,
      //   searchParams: { region: 'default', priceRange: 'default' },
      // })
      console.log('succcesssss')
      // NextResponse.redirect('/rentals')   
      // res.status(200).json({ redirectUrl: `/591` })
      res.redirect(307, `/591`)
    } catch (error) {
      res.status(500).json({ error: 'Failed to process Line Notify callback' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

//decodeToken
