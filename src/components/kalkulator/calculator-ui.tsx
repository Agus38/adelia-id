
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MAX_DIGITS = 15;

export function CalculatorUI() {
  const [displayValue, setDisplayValue] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [history, setHistory] = useState('');

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplayValue(digit);
      setWaitingForSecondOperand(false);
    } else {
      if (displayValue.length >= MAX_DIGITS) return;
      setDisplayValue(displayValue === '0' ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) {
      setOperator(nextOperator);
       if (firstOperand !== null) {
          setHistory(`${firstOperand.toLocaleString('id-ID')} ${nextOperator}`);
      }
      return;
    }

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      const resultString = String(parseFloat(result.toPrecision(15)));
      setDisplayValue(resultString);
      setFirstOperand(result);
    }
    
    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
    if(nextOperator !== '=') {
        setHistory(`${parseFloat(displayValue).toLocaleString('id-ID')} ${nextOperator}`);
    } else {
        setHistory('');
    }
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '×':
        return first * second;
      case '÷':
        return first / second;
      default:
        return second;
    }
  };

  const resetCalculator = () => {
    setDisplayValue('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setHistory('');
  };
  
  const clearEntry = () => {
    setDisplayValue('0');
  }

  const toggleSign = () => {
    setDisplayValue(String(parseFloat(displayValue) * -1));
  };
  
  const inputPercent = () => {
     const currentValue = parseFloat(displayValue);
     if (operator && firstOperand !== null) {
         // Calculate percentage of the first operand
         const percentageValue = (firstOperand * currentValue) / 100;
         setDisplayValue(String(percentageValue));
     } else {
        // Just calculate percentage of the current value (e.g. for display)
        setDisplayValue(String(currentValue / 100));
     }
  }

  const buttons = [
    { label: waitingForSecondOperand ? 'C' : 'AC', className: 'bg-muted hover:bg-muted/80', action: waitingForSecondOperand ? clearEntry : resetCalculator },
    { label: '±', className: 'bg-muted hover:bg-muted/80', action: toggleSign },
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
    { label: '0', className: 'col-span-2', action: () => inputDigit('0') },
    { label: '.', action: inputDecimal },
    { label: '=', className: 'bg-primary/80 hover:bg-primary text-primary-foreground', action: () => handleOperator('=') },
  ];
  
  const getFontSize = () => {
    const len = displayValue.length;
    if (len > 14) return 'text-2xl';
    if (len > 10) return 'text-3xl';
    if (len > 7) return 'text-4xl';
    return 'text-5xl';
  }

  return (
    <Card className="p-4 bg-background shadow-neumorphic-light rounded-3xl">
      <CardContent className="p-0">
        <div className="h-28 flex flex-col items-end justify-end p-4 rounded-2xl bg-muted shadow-neumorphic-light-inset mb-4">
           <p className="font-sans font-medium text-xl text-muted-foreground h-7 truncate">
             {history}
           </p>
          <p className={cn(
              "font-sans font-bold text-right break-all",
              getFontSize()
          )}>
            {parseFloat(displayValue).toLocaleString('id-ID', {maximumFractionDigits: 8})}
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
              {btn.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
