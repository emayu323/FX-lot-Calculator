'use client';

import { useState, useEffect } from 'react';

export default function Calculator() {
    // State
    const [balance, setBalance] = useState('');
    const [risk, setRisk] = useState('');
    const [lotUnit, setLotUnit] = useState(10000);
    const [pairType, setPairType] = useState('jpy');
    const [usdjpy, setUsdjpy] = useState('');
    const [pips, setPips] = useState('');
    
    // Result State
    const [resultLot, setResultLot] = useState('0.00');
    const [riskAmount, setRiskAmount] = useState(0);
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [fetchStatus, setFetchStatus] = useState('');
    const [mounted, setMounted] = useState(false);

    // Initial Load
    useEffect(() => {
        setMounted(true);
        const savedBalance = localStorage.getItem('fx_balance');
        const savedRisk = localStorage.getItem('fx_risk');
        const savedLotUnit = localStorage.getItem('fx_lotUnit');
        const savedPairType = localStorage.getItem('fx_pairType');
        const savedUsdjpy = localStorage.getItem('fx_usdjpy');
        
        if (savedBalance) setBalance(savedBalance);
        if (savedRisk) setRisk(savedRisk);
        if (savedLotUnit) setLotUnit(Number(savedLotUnit));
        if (savedPairType) setPairType(savedPairType);
        if (savedUsdjpy) setUsdjpy(savedUsdjpy);
    }, []);

    // Save and Calculate
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('fx_balance', balance || '');
        localStorage.setItem('fx_risk', risk || '');
        localStorage.setItem('fx_lotUnit', lotUnit);
        localStorage.setItem('fx_pairType', pairType);
        localStorage.setItem('fx_usdjpy', usdjpy || '');
        
        calculate();
    }, [balance, risk, lotUnit, pairType, usdjpy, pips, mounted]);

    const calculate = () => {
        const bal = parseFloat(balance) || 0;
        const rsk = parseFloat(risk) || 0;
        const unit = parseFloat(lotUnit) || 10000;
        const p = parseFloat(pips) || 0;
        const rate = parseFloat(usdjpy) || 0;

        if (bal > 0 && rsk > 0 && p > 0) {
            const rAmount = Math.floor(bal * (rsk / 100));
            setRiskAmount(rAmount);

            let valuePerPipPerLot = 0;
            if (pairType === 'jpy') {
                valuePerPipPerLot = unit * 0.01;
            } else {
                 if (rate > 0) {
                    valuePerPipPerLot = unit * 0.0001 * rate;
                 }
            }

            if (valuePerPipPerLot > 0) {
                let lots = rAmount / (p * valuePerPipPerLot);
                // Round down to 2 decimal places
                lots = Math.floor(lots * 100) / 100;
                setResultLot(lots.toFixed(2));
            } else {
                setResultLot('0.00');
            }
        } else {
            setResultLot('0.00');
            setRiskAmount(0);
        }
    };

    const fetchRate = async () => {
        setLoading(true);
        setFetchStatus('Checking...');
        try {
            const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!res.ok) throw new Error('Network error');
            const data = await res.json();
            const rate = data.rates.JPY;
            if (rate) {
                setUsdjpy(rate.toFixed(3));
                const date = new Date(data.date).toLocaleDateString();
                setFetchStatus(`Success: ${rate} (${date})`);
            } else {
                throw new Error('Rate not found');
            }
        } catch (e) {
            console.error(e);
            setFetchStatus('Failed. Enter manually.');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null; // Avoid hydration mismatch

    return (
        <div className="card">
            <h1 className="title">FX Lot Calculator</h1>

            <div className="form-group">
                <label htmlFor="balance">Account Balance (JPY)</label>
                <input 
                    type="number" 
                    id="balance" 
                    value={balance} 
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="e.g. 1000000"
                    className="input-field"
                />
            </div>

            <div className="form-group">
                <label htmlFor="risk">Risk (%)</label>
                <input 
                    type="number" 
                    id="risk" 
                    value={risk} 
                    onChange={(e) => setRisk(e.target.value)}
                    placeholder="e.g. 2.0"
                    step="0.1"
                    className="input-field"
                />
            </div>

            <div className="form-group">
                <label htmlFor="lotUnit">Currency per Lot</label>
                <select 
                    id="lotUnit" 
                    value={lotUnit} 
                    onChange={(e) => setLotUnit(Number(e.target.value))}
                    className="select-field"
                >
                    <option value={10000}>10,000 (Standard/Japan)</option>
                    <option value={100000}>100,000 (Global/XM)</option>
                    <option value={1000}>1,000 (Micro)</option>
                </select>
            </div>

            <div className="divider"></div>

            <div className="form-group">
                <label htmlFor="pairType">Currency Pair Type</label>
                <select 
                    id="pairType" 
                    value={pairType} 
                    onChange={(e) => setPairType(e.target.value)}
                    className="select-field"
                >
                    <option value="jpy">Cross JPY (USD/JPY, etc.)</option>
                    <option value="usd">Dollar Straight (EUR/USD, etc.)</option>
                </select>
            </div>

            {pairType === 'usd' && (
                <div className="form-group fade-in">
                    <label htmlFor="usdjpy">USD/JPY Rate</label>
                    <div className="rate-input-group">
                        <input 
                            type="number" 
                            id="usdjpy" 
                            value={usdjpy} 
                            onChange={(e) => setUsdjpy(e.target.value)}
                            placeholder="Current Rate"
                            step="0.01"
                            className="input-field"
                        />
                        <button 
                            type="button" 
                            onClick={fetchRate} 
                            disabled={loading}
                            className="btn-fetch"
                        >
                            {loading ? '...' : 'Auto Fetch'}
                        </button>
                    </div>
                    {fetchStatus && <div className={`status-text ${fetchStatus.includes('Failed') ? 'error' : 'success'}`}>{fetchStatus}</div>}
                </div>
            )}

            <div className="form-group highlight-group">
                <label htmlFor="pips">Stop Loss (Pips)</label>
                <input 
                    type="number" 
                    id="pips" 
                    value={pips} 
                    onChange={(e) => setPips(e.target.value)}
                    placeholder="e.g. 20"
                    className="input-field highlight-input"
                />
            </div>

            <div className="result-card">
                <div className="result-label">Recommended Lot Size</div>
                <div className="result-value">{resultLot}</div>
                <div className="risk-display">
                    Risk Amount: <span>{riskAmount.toLocaleString()}</span> JPY
                </div>
            </div>
        </div>
    );
}
