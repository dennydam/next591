//使用客戶端渲染
// 'use client'
import React, { useState } from 'react';
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Link from 'next/link'
import '../src/app/globals.css'
// 新北市 板橋26,新莊44,中和38,三重43,新店34,土城39,永和37,汐止27,蘆洲47,淡水50,樹林41,林口46,三峽40,五股48,鶯歌42,泰山45,八里49,瑞芳30,深坑28,三芝51,萬里20,金山21,貢寮33,石門52,雙溪32,石碇29,坪林35,烏來36,平溪31
// 萬里26 金山 44 貢寮38 
// 板橋區26 新莊44 三重43

// 台北市大安區5 內湖區10 士林區 8 北投區 9 中山區3  信義區7 松山區4 文山區12 萬華區6 中正區1 大同區2 南港區11

// 幫我districts 加上上面註解的數字要對應到區域並且 點選到 checkbox 的時候 會把數字帶入到 selectedDistricts 裡面 tapei region id是1 newtaipei region id是2 
const region = {
  taipei: 1,
  newtaipei: 2,
}
const districts = {
  taipei: [
    { name: '中正區', id: 1 },
    { name: '大同區', id: 2 },
    { name: '中山區', id: 3 },
    { name: '松山區', id: 4 },
    { name: '大安區', id: 5 },
    { name: '萬華區', id: 6 },
    { name: '信義區', id: 7 },
    { name: '士林區', id: 8 },
    { name: '北投區', id: 9 },
    { name: '內湖區', id: 10 },
    { name: '南港區', id: 11 },
    { name: '文山區', id: 12 },
  ],
  newTaipei: [
    { name: '板橋區', id: 26 }, 
    { name: '三重區', id: 43 },
    { name: '中和區', id: 38 },
    { name: '永和區', id: 37 },
    { name: '新莊區', id: 44 },
    { name: '新店區', id: 34 },
    { name: '樹林區', id: 41 },
    { name: '鶯歌區', id: 42 },
    { name: '三峽區', id: 40 }, 
    { name: '淡水區', id: 50 }, 
    { name: '汐止區', id: 27 },
    { name: '瑞芳區', id: 30 },
    { name: '萬里區', id: 20 },
    { name: '金山區', id: 21 },
    { name: '貢寮區', id: 33 },
    { name: '石門區', id: 52 },
    { name: '雙溪區', id: 32 },     
    { name: '石碇區', id: 29 },
    { name: '坪林區', id: 35 },
    { name: '烏來區', id: 36 },
    { name: '平溪區', id: 31 },
  ],
};


    
// const districts = {
//   taipei: [
//     { name: '中正區', id: 1 },
//     { name: '大同區', id: 2 },
//     { name: '中山區', id: 3 },
//     { name: '松山區', id: 4 },
//     { name: '大安區', id: 5 },
//     { name: '萬華區', id: 6 },
//     { name: '信義區', id: 7 },
//     { name: '士林區', id: 8 },
//     { name: '北投區', id: 9 },
//     { name: '內湖區', id: 10 },
//     { name: '南港區', id: 11 },
//     { name: '文山區', id: 12 },
//   ],
//   newTaipei: [
//     { name: '板橋區', id: 26 },
//     { name: '三重區', id: 43 },
//     { name: '中和區', id: 38 },
//     { name: '永和區', id: 37 },
//     { name: '新莊區', id: 44 },
//     { name: '新店區', id: 34 },
//     { name: '樹林區', id: 41 },
//     { name: '鶯歌區', id: 42 },
//     { name: '三峽區', id: 40 },
//     { name: '淡水區', id: 50 }, 
//     { name: '汐止區', id: 27 },
//     { name: '瑞芳區', id: 30 },
//     { name: '萬里區', id: 20 },
//     { name: '金山區', id: 21 },
//     { name: '貢寮區', id: 33 },
//     { name: '石門區', id: 52 },
//     { name: '雙溪區', id: 32 },
//     { name: '石碇區', id: 29 },
//     { name: '坪林區', id: 35 },
//     { name: '烏來區', id: 36 },
//     { name: '平溪區', id: 31 },
//   ],
// };




// const districts = {
//   taipei: [
//     '中正區', '大同區', '中山區', '松山區', '大安區', '萬華區',
//     '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'
//   ],
//   newTaipei: [
//     '板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區',
//     '樹林區', '鶯歌區', '三峽區', '淡水區', '汐止區', '瑞芳區'
//   ]
// };
//從localstorage 拿 user 的資料出來
// localStorage.setItem('user', JSON.stringify(data.user));
// const userString = localStorage.getItem('user');
// let userId:string

// //我後端重新導向回來 要確保css 樣式不會不見


const HomePage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserId(user.id);
      console.log('userid', user.id);
    } else {
      router.push('/login');
    }
  }, []);
  const [selectedDistricts, setSelectedDistricts] = useState<any[]>([]);

  const handleDistrictChange = (district: any) => {
    console.log('district',district)
    setSelectedDistricts(prev => 
      prev.includes(district.id)
        ? prev.filter(d => d !== district.id)
        : [...prev, district.id]
    );
  };
  const handleSearch = async () => {
    // 參數region 要判斷我選的是新北還是台北
    // 使用districts 的 key 來判斷 tapei是1 newtaipei是3
    const region = Object.keys(districts).find(key => districts[key as 'taipei' | 'newTaipei'].some(district => selectedDistricts.includes(district.id)));
    const regionId = region === 'taipei' ? '1' : '3';
    console.log('region',region)
    try {
      const response = await axios.post('/api/updatePreferences', {
        region:regionId,
        sectionid:selectedDistricts.join(','),
        minPrice:'10000',
        maxPrice:'20000',
        userId : userId,
        // propertyType: selectedPropertyType,
        // keyword
      });
      console.log('Preferences updated:', response.data);
      // 在這裡可以添加成功更新後的提示或其他操作
    } catch (error) {
      console.error('Error updating preferences:', error);
      // 在這裡可以添加錯誤處理邏輯
    }
  };

  return (
   <div className="container mx-auto px-4 py-12 bg-gray-100">
  <h1 className="text-5xl font-extrabold text-center mb-12 text-indigo-700">租屋搜尋</h1>
  
  <div className="mb-10">
    <input
      type="text"
      placeholder="搜索關鍵字"
      className="w-full p-4 border-2 border-indigo-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300"
    />
  </div>

  <div className="grid md:grid-cols-2 gap-12">
      {['台北市', '新北市'].map((city, index) => (
      <div key={city} className="bg-white p-6 rounded-xl shadow-lg border border-indigo-200">
        <h2 className="text-3xl font-bold mb-6 text-indigo-600">{city}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {districts[index === 0 ? 'taipei' : 'newTaipei'].map(district => (
            <label key={district.id} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedDistricts.includes(district.id)}
                onChange={() => handleDistrictChange(district)}
                className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span className="text-gray-700 group-hover:text-indigo-500 transition duration-150">{district.name}</span>
            </label>
            ))}
          </div>
        </div>
      ))}
  </div>

  <button 
    className="mt-12 w-full bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 shadow-lg"
    onClick={() => handleSearch()}
  >
    搜索房屋
  </button>
</div>
  );
};

export default HomePage;