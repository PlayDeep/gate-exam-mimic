
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const TemplateDownload = () => {
  const downloadTemplate = () => {
    const template = [
      {
        question_text: "What is 2 + 2?",
        question_image: "",
        option_a: "3",
        option_a_image: "",
        option_b: "4",
        option_b_image: "",
        option_c: "5",
        option_c_image: "",
        option_d: "6",
        option_d_image: "",
        correct_answer: "B",
        explanation: "2 + 2 equals 4",
        explanation_image: "",
        question_type: "MCQ",
        marks: 1,
        negative_marks: 0.33
      },
      {
        question_text: "Calculate the square root of 16",
        question_image: "",
        option_a: "",
        option_a_image: "",
        option_b: "",
        option_b_image: "",
        option_c: "",
        option_c_image: "",
        option_d: "",
        option_d_image: "",
        correct_answer: "4",
        explanation: "√16 = 4",
        explanation_image: "",
        question_type: "NAT",
        marks: 2,
        negative_marks: 0
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions Template");
    XLSX.writeFile(wb, "questions_template.xlsx");
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">Download Template</h4>
        <p className="text-sm text-gray-600">Get the Excel template with proper format</p>
      </div>
      <Button variant="outline" onClick={downloadTemplate}>
        <Download className="h-4 w-4 mr-2" />
        Download Template
      </Button>
    </div>
  );
};

export default TemplateDownload;
