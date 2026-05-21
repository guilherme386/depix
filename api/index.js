import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const UPDEPIX_API_KEY = process.env.UPDEPIX_API_KEY || 'upx_a5ce6e07fff5046eb36eab2ebc584e719618ad885ce880ea7ee60fcc7eee9a95';

// Endpoint to create Pix via Updepix API
app.post('/api/pix/create', async (req, res) => {
    const { name, amount, message, cpf } = req.body;

    console.log(`[Updepix] Creating Pix for ${name} - R$${amount}...`);
    try {
        const floatAmount = parseFloat(amount);
        if (isNaN(floatAmount) || floatAmount <= 0) {
            return res.status(400).json({ error: 'Valor do Pix inválido.' });
        }

        // Updepix API expects amount, external_id, payer_name, payer_tax_number, etc.
        const response = await axios.post('https://updepix.cc/api/v1/deposits', {
            amount: floatAmount,
            external_id: `site_${Date.now()}`,
            payer_name: name || 'Cliente Web',
            payer_tax_number: cpf || null,
            pass_fees_to_payer: false
        }, {
            headers: {
                'Authorization': `Bearer ${UPDEPIX_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.success) {
            const dep = response.data.data;
            console.log(`[Updepix] Pix generated successfully! ID: ${dep.id}`);
            return res.json({
                id: dep.id,
                qrCode: dep.qr_image_url,
                copyPaste: dep.qr_copy_paste,
                status: dep.status.toUpperCase() // 'PENDING'
            });
        } else {
            throw new Error(response.data.message || 'Falha ao processar resposta do Updepix');
        }

    } catch (error) {
        console.error("[Updepix] Error creating Pix:", error.response?.data || error.message);
        const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.message;
        return res.status(error.response?.status || 500).json({ 
            error: `Erro ao gerar Pix: ${errorDetail}` 
        });
    }
});

// Endpoint to check status via Updepix API
app.get('/api/pix/status/:id', async (req, res) => {
    const { id } = req.params;

    if (!id || id === 'undefined') {
        return res.status(400).json({ error: 'ID de transação inválido' });
    }

    try {
        const response = await axios.get(`https://updepix.cc/api/v1/deposits/${id}`, {
            headers: {
                'Authorization': `Bearer ${UPDEPIX_API_KEY}`
            }
        });

        if (response.data && response.data.success) {
            const dep = response.data.data;
            // Map Updepix "completed" status to "PAID" expected by the frontend
            let status = 'PENDING';
            if (dep.status === 'completed') {
                status = 'PAID';
            } else if (dep.status === 'failed' || dep.status === 'expired') {
                status = 'FAILED';
            }
            
            console.log(`[Updepix] Status query for ${id}: ${dep.status} -> ${status}`);
            return res.json({ status });
        } else {
            throw new Error(response.data.message || 'Falha ao consultar status no Updepix');
        }
    } catch (error) {
        console.error(`[Updepix] Error checking status for ${id}:`, error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({ error: 'Falha ao consultar status do Pix.' });
    }
});

// For local development, still listen on a port if executed directly
if (process.env.NODE_ENV !== 'production') {
    const PORT = 3001;
    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`);
    });
}

export default app;
