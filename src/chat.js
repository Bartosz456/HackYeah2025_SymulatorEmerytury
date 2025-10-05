import React, { useState, useCallback, useRef, useEffect } from 'react';

// Ustawienia API Key i Adresu API (Gemini-2.5-flash)
const apiKey = "";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

const getRgb = (colorString) => `rgb(${colorString})`;

// ----------------------------------------------------------------------
// 1. WIDŻET WYŚWIETLANIA (W kolumnie Środkowej)
// Wyświetla wiadomości AI i Awatar
// ----------------------------------------------------------------------

export const CenterChatDisplay = React.memo(({ messages, colors, avatar, params }) => {
    const ZUS_GREEN = getRgb(colors.GREEN);

    // Znajdź najnowszą wiadomość AI
    const latestGptMessage = messages.slice().reverse().find(msg => msg.role === 'gpt' || msg.role === 'system');

    // Użyj awatara, chyba że to wiadomość systemowa na start
    const currentAvatar = latestGptMessage?.role === 'system' ? avatar.neutralny : avatar.szczesliwy;

    return (
        <div style={{ padding: '10px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <h2 style={{ marginBottom: '5px' }}>
                Asystent <span style={{ color: ZUS_GREEN }}>ZUS AI</span>
            </h2>
            <div className="center-result-value" style={{ fontSize: '18px', color: getRgb(colors.DARK) }}>
                {latestGptMessage?.content || 'Zacznij rozmowę!'}
            </div>
            <img 
                src={currentAvatar}
                alt="Awatar Asystenta" 
                className="avatar-image" 
                style={{ marginTop: '15px', maxWidth: '80%' }}
            />
        </div>
    );
});


// ----------------------------------------------------------------------
// 2. WIDŻET WEJŚCIA (W kolumnie Prawej)
// Wyświetla historię czatu użytkownika i pole do wprowadzania
// ----------------------------------------------------------------------

export const RightChatInput = React.memo(({ messages, input, setInput, sendMessage, isLoading, colors }) => {
    const messagesEndRef = useRef(null);
    const ZUS_DARK = getRgb(colors.DARK);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="card chat-widget-card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: ZUS_DARK, marginBottom: '10px' }}>
                Twoja dyskusja (Historia)
            </h2>
            
            {/* Okno historii wiadomości użytkownika */}
            <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '15px', paddingRight: '10px', scrollbarWidth: 'thin' }}>
                {messages.map((msg, index) => (
                    // Wyświetlaj tylko wiadomości użytkownika w tej kolumnie
                    msg.role === 'user' && (
                        <div 
                            key={index} 
                            style={{ 
                                textAlign: 'right', // Wiadomości użytkownika zawsze po prawej
                                marginBottom: '10px',
                            }}
                        >
                            <span style={{
                                display: 'inline-block',
                                padding: '8px 12px',
                                borderRadius: '18px',
                                backgroundColor: ZUS_DARK, 
                                color: 'white',
                                fontSize: '14px',
                                maxWidth: '90%',
                                textAlign: 'left'
                            }}>
                                {msg.content}
                            </span>
                        </div>
                    )
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input i przycisk */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "Asystent myśli..." : "Zadaj pytanie..."}
                    disabled={isLoading}
                    style={{ 
                        flexGrow: 1, 
                        padding: '8px 10px', 
                        borderRadius: '6px', 
                        border: '2px solid #ccc',
                        borderColor: isLoading ? 'gold' : '#ccc'
                    }}
                />
                <button 
                    onClick={sendMessage} 
                    disabled={isLoading || !input.trim()}
                    className="action-button blue"
                    style={{ 
                        padding: '8px 15px', 
                        borderRadius: '6px', 
                        border: 'none', 
                        backgroundColor: isLoading || !input.trim() ? 'lightgray' : getRgb(colors.BLUE), 
                        color: 'white',
                        fontWeight: '600',
                        cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {isLoading ? '...' : 'Wyślij'}
                </button>
            </div>
        </div>
    );
});


// ----------------------------------------------------------------------
// 3. KONTENER LOGICZNY CZATU (Główna logika API i Stanu)
// Domyślny export ChatWidget
// ----------------------------------------------------------------------

const ChatWidget = ({ params, colors }) => {
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Witaj! Jestem Asystentem ZUS. Zapytaj mnie, jak parametry Twojej symulacji wpłyną na Twoją przyszłą emeryturę.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Funkcja do wywoływania API Gemini z kontekstem
    const callGeminiApi = useCallback(async (userMessage) => {
        const systemPrompt = `Jesteś ekspertem ZUS i doradcą emerytalnym. Twoim zadaniem jest odpowiadanie na pytania użytkownika dotyczące symulacji emerytalnej. 
        Użytkownik obecnie ma następujące parametry symulacji (kontekst):
        - Wiek: ${params.age}
        - Płeć: ${params.sex === 'M' ? 'Mężczyzna' : 'Kobieta'}
        - Wynagrodzenie Brutto: ${params.gross} zł
        - Lata pracy: ${params.retireYear - params.startYear}
        - Oczekiwana Emerytura: ${params.expectedMonthly} zł
        Odpowiadaj profesjonalnie, używając języka ZUS, ale w sposób zrozumiały dla młodego człowieka (poniżej 18 lat). Udzielaj krótkich, pomocnych rad.`;

        const payload = {
            contents: [{ parts: [{ text: userMessage }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        const maxRetries = 5;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (text) {
                    return text;
                } else {
                    return "Przepraszam, Asystent ZUS nie mógł przetworzyć tej prośby. Spróbuj zadać inne pytanie.";
                }

            } catch (error) {
                attempt++;
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                } else {
                    console.error('Błąd komunikacji z API:', error);
                    throw new Error('Nie udało się połączyć z Asystentem ZUS po wielu próbach.');
                }
            }
        }
    }, [params]);

    // Funkcja do wysyłania wiadomości i aktualizacji stanu
    const sendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const newUserMessage = { role: 'user', content: input.trim() };
        
        // Zapisz nową wiadomość użytkownika
        setMessages((prev) => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const reply = await callGeminiApi(newUserMessage.content);
            const newGPTMessage = { role: 'gpt', content: reply };
            
            // Zapisz odpowiedź od AI
            setMessages((prev) => [...prev, newGPTMessage]);

        } catch (error) {
            setMessages((prev) => [...prev, { role: 'error', content: 'Błąd połączenia z serwerem. Spróbuj ponownie za chwilę.' }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, callGeminiApi]);
    
    // Eksportuj logikę stanu i funkcje
    return { messages, input, setInput, sendMessage, isLoading };
};

export default ChatWidget;
