import React from 'react'
import Login from './component/Login'
import Register from './component/Register'
import DashBoard from './pages/DashBoard'
import About from './pages/About'
import Products from './pages/Products'
import CategoryPage from './pages/CategoryPage'
import Contact from './pages/Contact'
import UserDetails from './pages/UserDetails'
import Support from './pages/Support'
import PaymentSuccess from './pages/PaymentSuccess'

const routes = [
  {
    layout: "main",
    pages: [
      {
        path: 'dashboard',
        name: 'dashboard',
        element: <DashBoard />
      },
      {
        path: 'products',
        name: 'products',
        element: <Products />
      },
      {
        path: 'fashion',
        name: 'fashion',
        element: <CategoryPage
          routeName="fashion"
          category={['mens-shirts', 'mens-shoes', 'mens-watches', 'womens-dresses', 'womens-shoes', 'womens-watches', 'womens-jewellery', 'tops', 'womens-bags', 'sunglasses']}
          subCategories={[
            {
              name: "Men's Collection",
              subtitle: "Premium shirts, shoes, and luxury timepieces",
              keys: ['mens-shirts', 'mens-shoes', 'mens-watches', 'sunglasses']
            },
            {
              name: "Women's Collection",
              subtitle: "Elegant dresses, bags, and artisan jewellery",
              keys: ['womens-dresses', 'womens-shoes', 'womens-watches', 'womens-bags', 'womens-jewellery', 'tops']
            },
            {
              name: "Children & Kids",
              subtitle: "Cute and comfortable styles for the little ones",
              keys: ['mens-shirts', 'womens-dresses', 'tops'],
              gender: 'kids'
            }
          ]}
        />
      },
      {
        path: 'electronics',
        name: 'electronics',
        element: <CategoryPage
          routeName="electronics"
          category="laptops"
        />
      },
      {
        path: 'bag',
        name: 'bag',
        element: <CategoryPage
          routeName="bag"
          category="womens-bags"
        />
      },
      {
        path: 'footwear',
        name: 'footwear',
        element: <CategoryPage
          routeName="footwear"
          category="mens-shoes"
        />
      },
      {
        path: 'grocery',
        name: 'grocery',
        element: <CategoryPage
          routeName="grocery"
          category="groceries"
          subCategories={[
            {
              name: "Vegetables & Fruits",
              subtitle: "Purely organic and fresh",
              keys: ['groceries'],
              exclude: ['meat', 'fish', 'eggs', 'chicken', 'beef', 'pork', 'lamb', 'mutton', 'seafood', 'prawn', 'crab']
            },
            {
              name: "Non-Veg & Protein",
              subtitle: "Freshly sourced high-quality protein",
              keys: ['groceries'],
              include: ['meat', 'fish', 'eggs', 'chicken', 'beef', 'pork', 'lamb', 'mutton', 'seafood', 'prawn', 'crab']
            }
          ]}
        />
      },
      {
        path: 'beauty',
        name: 'beauty',
        element: <CategoryPage
          routeName="beauty"
          category="beauty"
        />
      },
      {
        path: 'about',
        name: 'about',
        element: <About />
      },
      {
        path: 'support',
        name: 'support',
        element: <Support />
      },
      {
        path: 'contact',
        name: 'contact',
        element: <Contact />
      },
      {
        path: 'account',
        name: 'account',
        element: <UserDetails />
      },
      {
        path: 'payment-success',
        name: 'payment-success',
        element: <PaymentSuccess />
      }
    ]

  }
  ,
  {
    layout: "auth",
    pages: [
      {
        path: "/",
        name: "login",
        element: <Login />
      },
      {
        path: "/register",
        name: "register",
        element: <Register />
      }
    ]
  }
]

export default routes
