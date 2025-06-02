
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const ExamCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);
  const [isRadians, setIsRadians] = useState(true);

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

  const clearEntry = () => {
    setDisplay('0');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
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
      case '^':
        return Math.pow(firstValue, secondValue);
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
        result = isRadians ? Math.sin(inputValue) : Math.sin(inputValue * Math.PI / 180);
        break;
      case 'cos':
        result = isRadians ? Math.cos(inputValue) : Math.cos(inputValue * Math.PI / 180);
        break;
      case 'tan':
        result = isRadians ? Math.tan(inputValue) : Math.tan(inputValue * Math.PI / 180);
        break;
      case 'asin':
        result = isRadians ? Math.asin(inputValue) : Math.asin(inputValue) * 180 / Math.PI;
        break;
      case 'acos':
        result = isRadians ? Math.acos(inputValue) : Math.acos(inputValue) * 180 / Math.PI;
        break;
      case 'atan':
        result = isRadians ? Math.atan(inputValue) : Math.atan(inputValue) * 180 / Math.PI;
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
      case 'cube':
        result = Math.pow(inputValue, 3);
        break;
      case 'factorial':
        result = factorial(inputValue);
        break;
      case 'exp':
        result = Math.exp(inputValue);
        break;
      case '1/x':
        result = 1 / inputValue;
        break;
      case 'abs':
        result = Math.abs(inputValue);
        break;
      case 'negate':
        result = -inputValue;
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n: number): number => {
    if (n < 0 || n !== Math.floor(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const memoryOperation = (operation: string) => {
    const inputValue = parseFloat(display);
    switch (operation) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(memory + inputValue);
        break;
      case 'M-':
        setMemory(memory - inputValue);
        break;
      case 'MS':
        setMemory(inputValue);
        break;
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg w-96 border">
      {/* Display */}
      <div className="bg-white border-2 border-gray-300 p-3 rounded mb-4">
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">
            {memory !== 0 && <span className="mr-2">M</span>}
            <span>{isRadians ? 'RAD' : 'DEG'}</span>
          </div>
          <div className="text-2xl font-mono h-8 overflow-hidden">{display}</div>
        </div>
      </div>

      {/* Mode and Memory Row */}
      <div className="grid grid-cols-6 gap-1 mb-2">
        <Button variant="outline" size="sm" onClick={() => setIsRadians(!isRadians)}>
          {isRadians ? 'RAD' : 'DEG'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => memoryOperation('MC')}>MC</Button>
        <Button variant="outline" size="sm" onClick={() => memoryOperation('MR')}>MR</Button>
        <Button variant="outline" size="sm" onClick={() => memoryOperation('M+')}>M+</Button>
        <Button variant="outline" size="sm" onClick={() => memoryOperation('M-')}>M-</Button>
        <Button variant="outline" size="sm" onClick={() => memoryOperation('MS')}>MS</Button>
      </div>

      {/* Scientific Functions Row 1 */}
      <div className="grid grid-cols-6 gap-1 mb-2">
        <Button variant="outline" size="sm" onClick={() => performScientific('sin')}>sin</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('cos')}>cos</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('tan')}>tan</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('asin')}>sin⁻¹</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('acos')}>cos⁻¹</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('atan')}>tan⁻¹</Button>
      </div>

      {/* Scientific Functions Row 2 */}
      <div className="grid grid-cols-6 gap-1 mb-2">
        <Button variant="outline" size="sm" onClick={() => performScientific('log')}>log</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('ln')}>ln</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('exp')}>eˣ</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('sqrt')}>√</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('square')}>x²</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('cube')}>x³</Button>
      </div>

      {/* Scientific Functions Row 3 */}
      <div className="grid grid-cols-6 gap-1 mb-2">
        <Button variant="outline" size="sm" onClick={() => performScientific('1/x')}>1/x</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('factorial')}>x!</Button>
        <Button variant="outline" size="sm" onClick={() => performOperation('^')}>xʸ</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('abs')}>|x|</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('pi')}>π</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('e')}>e</Button>
      </div>

      {/* Main Calculator */}
      <div className="grid grid-cols-5 gap-1">
        {/* Row 1 */}
        <Button variant="destructive" size="sm" onClick={clear}>C</Button>
        <Button variant="outline" size="sm" onClick={clearEntry}>CE</Button>
        <Button variant="outline" size="sm" onClick={backspace}>⌫</Button>
        <Button variant="outline" size="sm" onClick={() => performScientific('negate')}>±</Button>
        <Button variant="outline" size="sm" onClick={() => performOperation('÷')}>÷</Button>

        {/* Row 2 */}
        <Button variant="outline" size="sm" onClick={() => inputNumber('7')}>7</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('8')}>8</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('9')}>9</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('(')}>(</Button>
        <Button variant="outline" size="sm" onClick={() => performOperation('×')}>×</Button>

        {/* Row 3 */}
        <Button variant="outline" size="sm" onClick={() => inputNumber('4')}>4</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('5')}>5</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('6')}>6</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber(')')}>)</Button>
        <Button variant="outline" size="sm" onClick={() => performOperation('-')}>-</Button>

        {/* Row 4 */}
        <Button variant="outline" size="sm" onClick={() => inputNumber('1')}>1</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('2')}>2</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('3')}>3</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('0')}>0</Button>
        <Button variant="outline" size="sm" onClick={() => performOperation('+')}>+</Button>

        {/* Row 5 */}
        <Button variant="outline" size="sm" className="col-span-2" onClick={inputDot}>.</Button>
        <Button variant="outline" size="sm" onClick={() => inputNumber('00')}>00</Button>
        <Button variant="default" size="sm" className="col-span-2" onClick={() => performOperation('=')}>=</Button>
      </div>
    </div>
  );
};
