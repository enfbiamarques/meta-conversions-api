export default async function handler(req, res) {
  try {
    // Apenas aceitar solicitações POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }
    
    // Obter dados do corpo da requisição
    const eventData = req.body;
    
    // Validar dados básicos
    if (!eventData || !eventData.event_name) {
      return res.status(400).json({ error: 'Dados do evento incompletos' });
    }
    
    // Configurar os parâmetros do evento
    const conversionData = {
      event_name: eventData.event_name,
      event_time: eventData.event_time || Math.floor(Date.now() / 1000),
      action_source: eventData.action_source || 'website',
      messaging_channel: 'whatsapp',
      page_id: process.env.META_PAGE_ID
    };
    
    // Adicionar parâmetros específicos baseados no tipo de evento
    if (eventData.event_name === 'Purchase') {
      conversionData.currency = eventData.currency;
      conversionData.value = eventData.value;
    }
    
    // Adicionar parâmetros de informações do cliente
    if (eventData.user_data) {
      conversionData.user_data = eventData.user_data;
    }
    
    console.log('Enviando dados para a Meta:', conversionData);
    
    // Enviar dados para a API da Meta
    const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [conversionData],
        access_token: process.env.META_ACCESS_TOKEN
      })
    });
    
    const responseData = await response.json();
    console.log('Resposta da Meta:', responseData);
    
    return res.status(200).json({
      success: true,
      meta_response: responseData
    });
  } catch (error) {
    console.error('Erro ao processar conversão:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
