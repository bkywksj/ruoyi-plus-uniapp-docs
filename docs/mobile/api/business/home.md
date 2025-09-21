# 首页接口 (home)

移动端首页相关接口。

## 首页数据

```javascript
// GET /business/home/data
export const getHomeData = () => {
  return request.get('/business/home/data')
}

// 返回数据
{
  banners: [
    {
      id: 1,
      title: '轮播图1',
      image: 'https://example.com/banner1.jpg',
      link: '/pages/detail/detail?id=1',
      sort: 1
    }
  ],
  notices: [
    {
      id: 1,
      title: '公告标题',
      content: '公告内容',
      createTime: '2023-10-01 10:00:00'
    }
  ],
  stats: {
    userCount: 10000,
    orderCount: 5000,
    productCount: 200
  }
}
```

## 轮播图

```javascript
// GET /business/home/banners
export const getBanners = (position = 'home') => {
  return request.get('/business/home/banners', {
    params: { position }
  })
}
```

## 公告列表

```javascript
// GET /business/home/notices
export const getNotices = (pageNum = 1, pageSize = 10) => {
  return request.get('/business/home/notices', {
    params: { pageNum, pageSize }
  })
}
```

## 热门商品

```javascript
// GET /business/home/hot-products
export const getHotProducts = (limit = 10) => {
  return request.get('/business/home/hot-products', {
    params: { limit }
  })
}
```