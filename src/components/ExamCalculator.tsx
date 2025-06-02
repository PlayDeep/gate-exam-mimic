
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const ExamCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performScientific = (func: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin':
        result = Math.sin(inputValue * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(inputValue * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(inputValue * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case 'square':
        result = inputValue * inputValue;
        break;
      case 'factorial':
        result = factorial(inputValue);
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const ButtonGrid = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`grid ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="bg-gray-100 p-4 rounded-lg w-80">
      {/* Display */}
      <div className="bg-black text-white p-4 rounded mb-4 text-right">
        <div className="text-2xl font-mono overflow-hidden">{display}</div>
      </div>

      {/* Scientific Functions */}
      <ButtonGrid className="grid-cols-4 gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => performScientific('sin')}>sin</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('cos')}>cos</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('tan')}>tan</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('log')}>log</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('ln')}>ln</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('sqrt')}>√</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('square')}>x²</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('factorial')}>x!</Button>
      </ButtonGrid>

      {/* Main Calculator */}
      <ButtonGrid className="grid-cols-4 gap-2">
        <Button variant="destructive" onClick={clear}>C</Button>
        <Button variant="outline" onClick={() => setDisplay(display.slice(0, -1) || '0')}>←</Button>
        <Button variant="outline" onClick={() => performOperation('÷')}>÷</Button>
        <Button variant="outline" onClick={() => performOperation('×')}>×</Button>

        <Button variant="outline" onClick={() => inputNumber('7')}>7</Button>
        <Button variant="outline" onClick={() => inputNumber('8')}>8</Button>
        <Button variant="outline" onClick={() => inputNumber('9')}>9</Button>
        <Button variant="outline" onClick={() => performOperation('-')}>-</Button>

        <Button variant="outline" onClick={() => inputNumber('4')}>4</Button>
        <Button variant="outline" onClick={() => inputNumber('5')}>5</Button>
        <Button variant="outline" onClick={() => inputNumber('6')}>6</Button>
        <Button variant="outline" onClick={() => performOperation('+')}>+</Button>

        <Button variant="outline" onClick={() => inputNumber('1')}>1</Button>
        <Button variant="outline" onClick={() => inputNumber('2')}>2</Button>
        <Button variant="outline" onClick={() => inputNumber('3')}>3</Button>
        <Button variant="default" className="row-span-2" onClick={() => performOperation('=')}>=</Button>

        <Button variant="outline" className="col-span-2" onClick={() => inputNumber('0')}>0</Button>
        <Button variant="outline" onClick={inputDot}>.</Button>
      </ButtonGrid>
    </div>
  );
};
