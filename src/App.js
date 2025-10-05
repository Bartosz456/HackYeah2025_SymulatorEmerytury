import React, { useState, useMemo } from 'react';
import InputForm from './components/InputForm';
import SalaryChart from './components/SalaryChart';
import { projectSalaryPath, estimatePension } from './utils/calculations';
import { ZUS_COLORS } from './utils/constants';
import './App.css';
// Import awatarów
import neutralny from './assets/neutralny.png';
import szczesliwy from './assets/szczesliwy.png';
import smutny from './assets/smutny.png';
// Import logiki czatu (hook) ORAZ jego podzielonych widoków (komponenty)
import ChatWidget, { CenterChatDisplay, RightChatInput } from './chat';

// Obiekty awatarów
const AVATARS = {
    neutralny,
    szczesliwy,
    smutny,
};

// --- KOLUMNA ŚRODKOWA (Wynik ORAZ Widok AI) ---
const CenterColumn = ({ estimate, params, chatState }) => {
  // Sprawdzamy, czy estimate.realPension istnieje i ma wartość
  const currentRetirementValue = estimate?.realPension
    ? estimate.realPension.toFixed(0)
    : 0;
  
  // Funkcja pomocnicza do pobierania koloru z ZUS_COLORS
  const getRgb = (colorString) => `rgb(${colorString})`;

  return (
    <div className="card card-center">
        {/* Sekcja wyniku symulacji (oryginalna funkcjonalność) */}
        <div style={{ marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '5px' }}>
                Twoja <span style={{ color: getRgb(ZUS_COLORS.green) }}>emerytura</span> wynosi
            </h2>
            <div className="center-result-value">
                {currentRetirementValue} zł
            </div>
        </div>
        
        {/* SEKCJA: ASYSTENT AI - Wyświetlanie odpowiedzi AI */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            {/* Używamy CenterChatDisplay, który jest komponentem wizualnym */}
            <CenterChatDisplay 
                messages={chatState.messages} 
                colors={ZUS_COLORS} 
                avatar={AVATARS} 
                params={params}
            />
        </div>
    </div>
  );
};

// --- APLIKACJA GŁÓWNA ---
export default function App() {
  const [params, setParams] = useState({
    age: 30,
    sex: 'M',
    gross: 8000,
    startYear: new Date().getFullYear() - 10,
    retireYear: new Date().getFullYear() + 35,
    includeSick: true,
    savedAccount: 0,
    expectedMonthly: 4000
  });

  // liczba lat pracy
  const yearsToWork = Math.max(0, params.retireYear - params.startYear + 1);

  const salaryPath = useMemo(
    () => projectSalaryPath(params.gross, params.startYear, yearsToWork),
    [params.gross, params.startYear, yearsToWork]
  );

  const estimate = useMemo(() => {
    const result = estimatePension({ params, salaryPath });
    return result;
  }, [params, salaryPath]);

  // LOGIKA CZATU - WYWOŁANIE HOOKA
  // W ten sposób pobieramy stan i funkcje (obiekt), a nie komponent
  const chatState = ChatWidget({ params, colors: ZUS_COLORS });


  return (
    <div className="app-root">
      
      {/* GÓRNY PASEK */}
      <header className="header-top">
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="zus-logo">ZUS</div>
          <h1 style={{ fontSize: '18px' }}> Symulator emerytalny</h1> 
        </div>
        <div className="nav-menu">
            <div className="hamburger-menu">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </header>

     {/* Główna sekcja 3-kolumnowa */}
<main className="grid-layout">

  {/* LEWA KOLUMNA */}
  <aside className="card card-left"> 
    <h2 style={{ fontSize: '18px', margin: '0 0 16px 0' }}>Stwórz swoją postać!</h2>
    <InputForm params={params} setParams={setParams} colors={ZUS_COLORS} />
    <div style={{ textAlign: 'right', marginTop: '15px' }}>
      <button className="action-button blue">
        Więcej <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 -5 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M13 18l6 -6" /><path d="M13 6l6 6" /></svg>
      </button>
    </div>
  </aside>

  {/* ŚRODKOWA KOLUMNA */}
  <div className="card card-center">
    <CenterColumn estimate={estimate} params={params} chatState={chatState} />
  </div>

  {/* PRAWA KOLUMNA */}
  <aside className="card card-right">
    <RightChatInput 
      messages={chatState.messages}
      input={chatState.input}
      setInput={chatState.setInput}
      sendMessage={chatState.sendMessage}
      isLoading={chatState.isLoading}
      colors={ZUS_COLORS}
    />
  </aside>

</main>

      
      {/* WYKRES */}
      <section className="chart-wrapper">
        <div className="card">
          <h2>Projekcja wynagrodzenia (miesięcznie)</h2>
          <SalaryChart data={salaryPath} colors={ZUS_COLORS} />
        </div>
      </section>

      <footer className="footer">
        <small>Uwaga: prototyp edukacyjny — obliczenia uproszczone.</small>
      </footer>
    </div>
  );
}
