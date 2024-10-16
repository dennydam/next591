import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import axios from 'axios'
import FormData from 'form-data'
import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'

const prisma = new PrismaClient()
const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

async function fetchDataFrom591(region: string, minPrice: string, maxPrice: string, sectionid: string) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Referer: 'https://rent.591.com.tw/',
    }
    //依照sctionid ex:sectionid =1,2,3 這樣有三個 使用promise.all
    const sectionidArray = sectionid.split(',');
    // console.log('sectionidArray', sectionidArray)
    const promises = sectionidArray.map(sectionid => {
      return axios.get(`https://bff-house.591.com.tw/v1/web/rent/list?regionid=${region}&sectionidStr=${sectionid}&multiPrice=${minPrice}_${'50000'}&order=posttime&orderType=desc&other=balcony_1`, {
        headers: headers,
      }).then(response => response.data.data.data.slice(0, 2)) //只取得每個sectionid的前2筆
    })

    const responses = await Promise.all(promises)
    const data = responses // 
    // console.log('data', data)
   


    // console.log('respn59111111資訊',data)
     return data



    //  const response = await axios.get(`https://bff-house.591.com.tw/v1/web/rent/list?regionid=${regionid}&sectionidStr=${sectionid}&multiPrice=${minPrice}_${'50000'}&order=posttime&orderType=desc&other=balcony_1`, {
    //     headers: headers,
    //   })
    // console.log('respn59111111資訊 ',response.data)
    // return response.data.data.data
  } catch (error) {
    console.error('从 591 获取数据时出错:', error)
    throw error
  }
}
async function formatAndSendHouseData(houses: any[], lineNotifyToken: string) {
  // 将二维数组扁平化
  const flatHouses = houses.flat();
  console.log('flatHouses',flatHouses)
  console.log('总房屋数量:', flatHouses.length);

  for (let index = 0; index < flatHouses.length; index++) {
    const house = flatHouses[index];
    console.log('house',house)
  
    //我要儲存到users 的houses
    const house_id = house.id 
    // const user_id = house.user_id
    //如果裡面已經有這個house_id 就不存且不發送line通知
    const existingHouse = await prisma.house.findUnique({
      where: {
        house_id: house_id.toString(),
      },
    });
    if (existingHouse) {
      console.log('house_id 已存在:', house_id);
      continue;
    }
   await prisma.user.update({
    where: {
      id: 1,
    },
    data: {
      houses: {
        create: {
          house_id: house_id.toString(),
        },
      },
    },
  })
    // await prisma.user.update({
    //   where: {
    //     id: 1,
    //   },
    //   data: {
    //     houses: {
    //       create: {
    //         house_id: house_id,
    //       },
    //     },
    //   },
    // })
    let message = `${index + 1}. ${house.address_img_title}\n`
    message += `   价格: ${house.price} 元/月\n`
    message += `   详情: https://rent.591.com.tw/rent-detail-${house.id}.html\n\n`
    if(house.cover){
      message += `   封面: ${house.cover}\n`
    }
  

    const form = new FormData()
    form.append('message', message)

    try {
      const response = await axios.post('https://notify-api.line.me/api/notify', form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${lineNotifyToken}`,
        },
      })
      console.log(`成功发送第 ${index + 1} 条房屋信息`);
    } catch (error) {
      console.error(`发送第 ${index + 1} 条房屋信息时出错:`, error)
    }
  }
  console.log('所有房屋信息处理完毕');
}

// async function formatAndSendHouseData(houses: any, lineNotifyToken: string) {
//  //計算 houses 的總數
//  const totalHouses = houses.flat().length;
// //  只要console.log 前10筆
// const first10Houses = houses.flat().slice(0, 10);
// console.log('first10Houses',first10Houses)
// //  console.log('totalHouses',houses)
//   for (const [index, house] of houses) {
//     // 我的index會變成[object]

//     let message = `${index + 1}. ${house.address_img_title}\n`
//     message += `   價格: ${house.price} 元/月\n`
//     message += `   詳情: https://rent.591.com.tw/rent-detail-${house.id}.html\n\n`

//     const form = new FormData()
//     form.append('message', message)

//     // if (house.cover) {
//     //   form.append('imageFullsize', house.cover)
//     //   form.append('imageThumbnail', house.cover)
//     // }

//     try {
//       await axios.post('https://notify-api.line.me/api/notify', form, {
//         headers: {
//           ...form.getHeaders(),
//           Authorization: `Bearer ${lineNotifyToken}`,
//         },
//       })
//     } catch (error) {
//       console.error(`Error sending Line Notify for house ${index + 1}:`, error)
//     }
//   }
// }

async function processUserPreferences() {
  const users = await prisma.user.findMany({
    where: {
      lineNotifyToken: { not: null },
      lineNotifyStatus: 'SUBSCRIBED',
    },
    include: { preferences: true },
  })
  console.log('user', users)

  for (const user of users) {
    if (user.preferences) {
      const { region, minPrice, maxPrice, sectionid } = user.preferences
      console.log('region', region)
      console.log('minPrice', minPrice)
      console.log('maxPrice', maxPrice)
      console.log('sectionid', sectionid)
      const houses = await fetchDataFrom591(region, minPrice, maxPrice, sectionid)
      // console.log('houses',houses)
      await formatAndSendHouseData(houses, user.lineNotifyToken!)
    }
  }
}

// 每五分钟执行一次
// 設置每10秒執行一次
// setInterval(processUserPreferences, 30000)

// cron.schedule('*/1 * * * *', () => {
//   console.log('Running house search task...')
//   processUserPreferences().catch(console.error)
// })

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(port)

  console.log(`> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`)
})