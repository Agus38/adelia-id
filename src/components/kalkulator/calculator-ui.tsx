
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';

const MAX_DIGITS = 15;

export function CalculatorUI() {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [history, setHistory] = useState('');

  const formatNumber = (numStr: string) => {
    if (isNaN(parseFloat(numStr))) return 'Error';
    const [integerPart, decimalPart] = numStr.split('.');
    const formattedInteger = parseFloat(integerPart).toLocaleString('id-ID');
    return decimalPart !== undefined ? `${formattedInteger},${decimalPart}` : formattedInteger;
  };
  
  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
       if (displayValue.replace(/[.,-]/g, '').length >= MAX_DIGITS) return;
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplayValue('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue.replace(/,/g, '.'));

    if (operator && waitingForSecondOperand) {
        setOperator(nextOperator);
        setHistory(prev => prev.slice(0, -2) + ` ${nextOperator} `);
        return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
      setHistory(formatNumber(displayValue) + ` ${nextOperator} `);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      const resultString = String(parseFloat(result.toPrecision(15)));
      setDisplayValue(resultString);
      setFirstOperand(result);
      setHistory(prev => prev + formatNumber(displayValue) + ` ${nextOperator} `);
    } else {
      setFirstOperand(inputValue);
      setHistory(formatNumber(displayValue) + ` ${nextOperator} `);
    }
    
    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    if (operator === null || firstOperand === null || waitingForSecondOperand) return;
    
    const secondOperand = parseFloat(displayValue.replace(/,/g, '.'));
    const result = calculate(firstOperand, secondOperand, operator);
    const resultString = String(parseFloat(result.toPrecision(15)));
    
    setHistory('');
    setDisplayValue(resultString);
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(true);
  }
  
  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '×': return first * second;
      case '÷': return second === 0 ? NaN : first / second;
      default: return second;
    }
  };

  const resetCalculator = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setHistory('');
  };
  
  const backspace = () => {
    if (waitingForSecondOperand) return;
    if (displayValue.length === 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
        setDisplayValue('0');
    } else {
        setDisplayValue(displayValue.slice(0, -1));
    }
  };

  const toggleSign = () => {
    setDisplayValue(prev => 
        prev.startsWith('-') ? prev.slice(1) : (prev !== '0' ? `-${prev}` : '0')
    );
  };
  
  const inputPercent = () => {
     const currentValue = parseFloat(displayValue.replace(/,/g, '.'));
     if (firstOperand === null) {
         const result = currentValue / 100;
         setDisplayValue(String(result));
     } else if (operator) {
         const percentageValue = (firstOperand * currentValue) / 100;
         const result = calculate(firstOperand, percentageValue, operator);
         const resultString = String(parseFloat(result.toPrecision(15)));
         setHistory('');
         setDisplayValue(resultString);
         setFirstOperand(null);
         setOperator(null);
     }
     setWaitingForSecondOperand(true);
  }

  const buttons = [
    { label: 'AC', className: 'bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-400', action: resetCalculator },
    { label: 'C', icon: Delete, className: 'bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-400', action: backspace },
    { label: '%', className: 'bg-muted hover:bg-muted/80', action: inputPercent },
    { label: '÷', className: 'bg-primary/80 hover:bg-primary text-primary-foreground', action: () => handleOperator('÷') },
    { label: '7', action: () => inputDigit('7') },
    { label: '8', action: () => inputDigit('8') },
    { label: '9', action: () => inputDigit('9') },
    { label: '×', className: 'bg-primary/80 hover:bg-primary text-primary-foreground', action: () => handleOperator('×') },
    { label: '4', action: () => inputDigit('4') },
    { label: '5', action: () => inputDigit('5') },
    { label: '6', action: () => inputDigit('6') },
    { label: '-', className: 'bg-primary/80 hover:bg-primary text-primary-foreground', action: () => handleOperator('-') },
    { label: '1', action: () => inputDigit('1') },
    { label: '2', action: () => inputDigit('2') },
    { label: '3', action: () => inputDigit('3') },
    { label: '+', className: 'bg-primary/80 hover:bg-primary text-primary-foreground', action: () => handleOperator('+') },
    { label: '±', action: toggleSign },
    { label: '0', action: () => inputDigit('0') },
    { label: ',', action: inputDecimal },
    { label: '=', className: 'bg-primary/80 hover:bg-primary text-primary-foreground', action: handleEquals },
  ];
  
  const getFontSize = () => {
    const len = displayValue.length;
    if (len > 13) return 'text-2xl';
    if (len > 10) return 'text-3xl';
    if (len > 7) return 'text-4xl';
    return 'text-5xl';
  }

  return (
    <Card className="p-4 bg-background shadow-neumorphic-light rounded-3xl">
      <CardContent className="p-0">
        <div className="h-28 flex flex-col items-end justify-end p-4 rounded-2xl bg-muted shadow-neumorphic-light-inset mb-4">
           <div className="flex justify-end w-full h-7 overflow-hidden">
            <p className="font-sans font-medium text-lg text-muted-foreground whitespace-nowrap shrink min-w-0">
                {history || ' '}
            </p>
           </div>
          <p className={cn(
              "font-sans font-bold text-right break-all w-full",
              getFontSize()
          )}>
            {formatNumber(displayValue)}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn) => (
            <Button
              key={btn.label}
              variant="neumorphic"
              onClick={btn.action}
              className={cn(
                  "h-16 text-2xl rounded-2xl",
                  btn.className
              )}
            >
              {btn.icon ? <btn.icon/> : btn.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
