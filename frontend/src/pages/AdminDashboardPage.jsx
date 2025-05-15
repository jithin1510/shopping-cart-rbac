import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { AdminDashBoard } from '../features/admin/components/AdminDashBoard'
import { Footer } from '../features/footer/Footer'


export const AdminDashboardPage = () => {
  return (
    <>
    <Navbar isProductList={true}/>
    <AdminDashBoard/>
    <Footer/>
    </>
  )
}
