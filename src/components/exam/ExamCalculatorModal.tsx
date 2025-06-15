
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calculator, X } from "lucide-react";

interface ExamCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExamCalculatorModal = ({ isOpen, onClose }: ExamCalculatorModalProps) => {
  const [display, setDisplay] = useState("0");
  const [memory, setMemory] = useState(0);
  const [isDegree, setIsDegree] = useState(true);
  const [previousValue, setPreviousValue] = useState(0);
  const [operation, setOperation] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === 0) {
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

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case "+": return firstValue + secondValue;
      case "-": return firstValue - secondValue;
      case "*": return firstValue * secondValue;
      case "/": return firstValue / secondValue;
      case "=": return secondValue;
      default: return secondValue;
    }
  };

  const performScientificFunction = (func: string) => {
    const value = parseFloat(display);
    let result = 0;

    switch (func) {
      case "sin":
        result = isDegree ? Math.sin(value * Math.PI / 180) : Math.sin(value);
        break;
      case "cos":
        result = isDegree ? Math.cos(value * Math.PI / 180) : Math.cos(value);
        break;
      case "tan":
        result = isDegree ? Math.tan(value * Math.PI / 180) : Math.tan(value);
        break;
      case "log":
        result = Math.log10(value);
        break;
      case "ln":
        result = Math.log(value);
        break;
      case "sqrt":
        result = Math.sqrt(value);
        break;
      case "square":
        result = value * value;
        break;
      case "factorial":
        result = factorial(value);
        break;
      case "1/x":
        result = 1 / value;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(0);
    setOperation("");
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay("0");
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const addDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const memoryOperation = (op: string) => {
    const value = parseFloat(display);
    switch (op) {
      case "MC":
        setMemory(0);
        break;
      case "MR":
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case "M+":
        setMemory(memory + value);
        break;
      case "M-":
        setMemory(memory - value);
        break;
      case "MS":
        setMemory(value);
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Scientific Calculator
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Display */}
          <div className="bg-gray-100 p-3 rounded text-right text-xl font-mono border">
            {display}
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-between items-center">
            <Button
              variant={isDegree ? "default" : "outline"}
              size="sm"
              onClick={() => setIsDegree(!isDegree)}
            >
              {isDegree ? "DEG" : "RAD"}
            </Button>
            <div className="text-sm text-gray-500">
              Memory: {memory !== 0 ? memory : "Empty"}
            </div>
          </div>

          {/* Memory Row */}
          <div className="grid grid-cols-5 gap-1">
            {["MC", "MR", "M+", "M-", "MS"].map((op) => (
              <Button
                key={op}
                variant="outline"
                size="sm"
                onClick={() => memoryOperation(op)}
                className="text-xs"
              >
                {op}
              </Button>
            ))}
          </div>

          {/* Scientific Functions */}
          <div className="grid grid-cols-4 gap-2">
            {["sin", "cos", "tan", "log"].map((func) => (
              <Button
                key={func}
                variant="outline"
                size="sm"
                onClick={() => performScientificFunction(func)}
                className="text-xs"
              >
                {func}
              </Button>
            ))}
            {["ln", "sqrt", "x²", "1/x"].map((func) => (
              <Button
                key={func}
                variant="outline"
                size="sm"
                onClick={() => performScientificFunction(func === "x²" ? "square" : func)}
                className="text-xs"
              >
                {func}
              </Button>
            ))}
          </div>

          {/* Main Calculator */}
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" onClick={clear}>C</Button>
            <Button variant="outline" onClick={clearEntry}>CE</Button>
            <Button variant="outline" onClick={toggleSign}>±</Button>
            <Button variant="outline" onClick={() => inputOperation("/")}>/</Button>

            <Button variant="outline" onClick={() => inputNumber("7")}>7</Button>
            <Button variant="outline" onClick={() => inputNumber("8")}>8</Button>
            <Button variant="outline" onClick={() => inputNumber("9")}>9</Button>
            <Button variant="outline" onClick={() => inputOperation("*")}>×</Button>

            <Button variant="outline" onClick={() => inputNumber("4")}>4</Button>
            <Button variant="outline" onClick={() => inputNumber("5")}>5</Button>
            <Button variant="outline" onClick={() => inputNumber("6")}>6</Button>
            <Button variant="outline" onClick={() => inputOperation("-")}>-</Button>

            <Button variant="outline" onClick={() => inputNumber("1")}>1</Button>
            <Button variant="outline" onClick={() => inputNumber("2")}>2</Button>
            <Button variant="outline" onClick={() => inputNumber("3")}>3</Button>
            <Button variant="outline" onClick={() => inputOperation("+")} className="row-span-2">+</Button>

            <Button variant="outline" onClick={() => inputNumber("0")} className="col-span-2">0</Button>
            <Button variant="outline" onClick={addDecimal}>.</Button>

            <Button variant="default" onClick={() => inputOperation("=")} className="col-span-4 bg-blue-600 hover:bg-blue-700">
              =
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamCalculatorModal;
