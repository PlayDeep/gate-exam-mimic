
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const TemplateDownload = () => {
  const downloadTemplate = () => {
    const template = [
      {
        question_text: "What is 2 + 2?",
        question_image: "https://example.com/math-problem.jpg",
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
        explanation_image: "https://example.com/explanation.jpg",
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
      },
      {
        question_text: "Look at the circuit diagram and identify the component:",
        question_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop",
        option_a: "Resistor",
        option_a_image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=150&fit=crop",
        option_b: "Capacitor", 
        option_b_image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=150&fit=crop",
        option_c: "Inductor",
        option_c_image: "",
        option_d: "Diode",
        option_d_image: "",
        correct_answer: "A",
        explanation: "This is a resistor symbol in circuit diagrams",
        explanation_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop",
        question_type: "MCQ",
        marks: 2,
        negative_marks: 0.5
      }
    ];

    // Add instructions sheet
    const instructions = [
      {
        "INSTRUCTIONS": "How to upload questions with images",
        "": "",
        " ": "",
        "  ": "",
        "   ": "",
        "    ": "",
        "     ": "",
        "      ": "",
        "       ": "",
        "        ": "",
        "         ": "",
        "          ": "",
        "           ": "",
        "            ": "",
        "             ": ""
      },
      {
        "INSTRUCTIONS": "1. For images, use direct URLs (https://...)",
        "": "2. question_image: URL for the main question image",
        " ": "3. option_a_image to option_d_image: URLs for option images",
        "  ": "4. explanation_image: URL for explanation image",
        "   ": "5. Leave image fields empty if no image needed",
        "    ": "6. For MCQ: Use A, B, C, or D as correct_answer",
        "     ": "7. For NAT: Use numerical value as correct_answer",
        "      ": "8. question_type: Either 'MCQ' or 'NAT'",
        "       ": "9. marks: Positive marks for correct answer",
        "        ": "10. negative_marks: Marks deducted for wrong MCQ",
        "         ": "11. For NAT questions, keep options empty",
        "          ": "12. Use reliable image hosting services",
        "           ": "13. Test image URLs before uploading",
        "            ": "14. Recommended image formats: JPG, PNG",
        "             ": "15. Keep images under 5MB for better performance"
      }
    ];

    const wb = XLSX.utils.book_new();
    
    // Add instructions sheet
    const instructionsWs = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, instructionsWs, "Instructions");
    
    // Add template sheet
    const templateWs = XLSX.utils.json_to_sheet(template);
    XLSX.utils.book_append_sheet(wb, templateWs, "Questions Template");
    
    XLSX.writeFile(wb, "questions_template_with_images.xlsx");
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium">Download Template with Image Support</h4>
        <p className="text-sm text-gray-600">
          Get the Excel template with proper format including image URL support and detailed instructions
        </p>
      </div>
      <Button variant="outline" onClick={downloadTemplate}>
        <Download className="h-4 w-4 mr-2" />
        Download Template
      </Button>
    </div>
  );
};

export default TemplateDownload;
