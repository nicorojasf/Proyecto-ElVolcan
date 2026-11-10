import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MenuLateral from './MenuLateral'
import Carrito from './Carrito'
import Footer from './Footer'
import { useCarrito } from '../context/CarritoContext'

export default function Layout() {
  const [verMenu, setVerMenu] = useState(false)
  const [verCarrito, setVerCarrito] = useState(false)
  const { totalItems } = useCarrito()

  return (
    <>
      <Navbar
        cantidad={totalItems}
        onMenu={() => setVerMenu(true)}
        onCarrito={() => setVerCarrito(true)}
      />

      <MenuLateral show={verMenu} onHide={() => setVerMenu(false)} />
      <Carrito show={verCarrito} onHide={() => setVerCarrito(false)} />

      <Outlet />
      <Footer />
    </>
  )
}