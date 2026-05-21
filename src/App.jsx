import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, User, DollarSign, MessageSquare, CheckCircle2, Loader2, ExternalLink } from 'lucide-react'
import axios from 'axios'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    message: '',
    cpf: ''
  })
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState(null) // { id, qrCode, copyPaste, status }
  const [polling, setPolling] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Timer logic
  useEffect(() => {
    let timer
    if (payment && payment.status === 'PENDING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setPolling(false)
    }
    return () => clearInterval(timer)
  }, [payment, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCreatePix = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeLeft(900) // Reset timer
    try {
      const response = await axios.post('/api/pix/create', formData)
      setPayment(response.data)
      setPolling(true)
    } catch (error) {
      console.error("Error creating Pix:", error)
      const errorMsg = error.response?.data?.error || "Erro ao gerar Pix. Verifique se o servidor backend está rodando.";
      alert(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Polling for payment status
  useEffect(() => {
    let interval
    if (polling && payment?.id) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/pix/status/${payment.id}`)
          if (response.data.status === 'PAID') {
            setPayment(prev => ({ ...prev, status: 'PAID' }))
            setPolling(false)
            clearInterval(interval)
          }
        } catch (error) {
          console.error("Polling error:", error)
        }
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [polling, payment?.id])

  return (
    <div className="container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <header>
          <div className="logo-icon">
            <QrCode size={40} color="#3b82f6" />
          </div>
          <h1>Pix Direct</h1>
          <p className="subtitle">Pagamento para anjelinobr</p>
        </header>

        {!payment ? (
          <form onSubmit={handleCreatePix}>
            <div className="input-group">
              <label><User size={16} /> Nome Completo</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Ex: João Silva" 
                required 
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label><DollarSign size={16} /> Valor (R$)</label>
              <input 
                type="number" 
                name="amount" 
                placeholder="0,00" 
                step="0.01" 
                min="2"
                required 
                value={formData.amount}
                onChange={handleChange}
              />
            </div>

            {parseFloat(formData.amount) > 500 && (
              <div className="input-group text-left">
                <label><User size={16} /> CPF / CNPJ do Pagador (Obrigatório acima de R$ 500)</label>
                <input 
                  type="text" 
                  name="cpf" 
                  placeholder="Ex: 123.456.789-00" 
                  required={parseFloat(formData.amount) > 500}
                  value={formData.cpf}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="input-group">
              <label><MessageSquare size={16} /> Mensagem (Opcional)</label>
              <textarea 
                name="message" 
                placeholder="Deixe um recado..." 
                rows="3"
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="primary" disabled={loading}>
              {loading ? (
                <><Loader2 className="spin" size={20} /> Gerando...</>
              ) : (
                'Gerar Pix'
              )}
            </button>
          </form>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="payment-display"
            >
              {payment.status === 'PAID' ? (
                <div className="success-message">
                  <CheckCircle2 size={64} color="#10b981" />
                  <h2>Pagamento Confirmado!</h2>
                  <p>Obrigado pelo seu Pix, {formData.name}.</p>
                  <button className="primary" onClick={() => setPayment(null)}>Novo Pix</button>
                </div>
              ) : (
                <>
                  <div className="timer-display">
                    Expira em: <span>{formatTime(timeLeft)}</span>
                  </div>

                  {timeLeft > 0 ? (
                    <>
                      <div className="qr-container">
                        <img src={payment.qrCode} alt="Pix QR Code" />
                      </div>
                      
                      <div className="copy-paste-section">
                        <label>Pix Copia e Cola</label>
                        <div className="copy-box">
                          <code>{payment.copyPaste.substring(0, 30)}...</code>
                          <button onClick={() => navigator.clipboard.writeText(payment.copyPaste)}>Copiar</button>
                        </div>
                      </div>

                      <div className={`status-badge status-pending`}>
                        <Loader2 className="spin" size={16} style={{marginRight: '8px'}} />
                        Aguardando Pagamento...
                      </div>
                    </>
                  ) : (
                    <div className="expired-notice">
                      <p>O QR Code expirou.</p>
                      <button className="primary" onClick={() => setPayment(null)}>Gerar Novo Pix</button>
                    </div>
                  )}

                  <p className="hint">O status será atualizado automaticamente.</p>
                  
                  <button className="text-button" onClick={() => setPayment(null)}>
                    Cancelar e Voltar
                  </button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
      
      <footer>
        <p>Integrado com Updepix via API</p>
      </footer>
    </div>
  )
}

export default App
