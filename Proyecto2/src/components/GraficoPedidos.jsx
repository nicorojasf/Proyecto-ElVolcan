import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

export default function GraficoPedidos() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const grafico = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Pedidos Completados',
          data: [210, 250, 290, 340],
          borderColor: '#ff5722',
          backgroundColor: 'rgba(255, 87, 34, 0.08)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    })

    return () => grafico.destroy()
  }, [])

  return (
    <div style={{ position: 'relative', height: 280 }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
