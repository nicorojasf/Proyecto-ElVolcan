import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Inicio from './pages/Inicio'
import Catalogo from './pages/Catalogo'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/productos" element={<Catalogo />} />
        <Route path="/productos/:slug" element={<Catalogo />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>

      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}