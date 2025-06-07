
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

const subjects = [
  { code: "CS", name: "Computer Science & Information Technology" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "EE", name: "Electrical Engineering" },
  { code: "CE", name: "Civil Engineering" },
  { code: "ECE", name: "Electronics & Communication" },
  { code: "CH", name: "Chemical Engineering" }
];

interface ExcelQuestion {
  question_text: string;
  question_image?: string;
  option_a: string;
  option_a_image?: string;
  option_b: string;
  option_b_image?: string;
  option_c: string;
  option_c_image?: string;
  option_d: string;
  option_d_image?: string;
  correct_answer: string;
  explanation?: string;
  explanation_image?: string;
  question_type: 'MCQ' | 'NAT';
  marks: number;
  negative_marks: number;
}

const ExcelQuestionUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ExcelQuestion[]>([]);
  const { toast } = useToast();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelQuestion[];
        
        setPreview(jsonData);
        toast({
          title: "File Parsed",
          description: `Found ${jsonData.length} questions in the Excel file`,
        });
      } catch (error) {
        toast({
          title: "Parse Error",
          description: "Failed to parse Excel file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadImageFromBase64 = async (base64String: string, fileName: string): Promise<string | null> => {
    try {
      // Convert base64 to blob
      const response = await fetch(base64String);
      const blob = await response.blob();
      
      const fileExt = fileName.split('.').pop();
      const filePath = `question-images/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('question-assets')
        .upload(filePath, blob);

      if (error) {
        console.error('Image upload error:', error);
        return null;
      }

      return data.path;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  const handleUpload = async () => {
    if (!file || !subject || preview.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a file, subject, and ensure there are questions to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const questionsToUpload = [];

      for (const question of preview) {
        // Process images if they exist (assuming they are base64 strings or URLs)
        let questionImageUrl = null;
        let explanationImageUrl = null;
        const optionImages: Record<string, string | null> = {};

        if (question.question_image) {
          questionImageUrl = await uploadImageFromBase64(question.question_image, 'question.jpg');
        }

        if (question.explanation_image) {
          explanationImageUrl = await uploadImageFromBase64(question.explanation_image, 'explanation.jpg');
        }

        // Process option images
        for (const optionKey of ['option_a_image', 'option_b_image', 'option_c_image', 'option_d_image']) {
          const imageData = question[optionKey as keyof ExcelQuestion] as string;
          if (imageData) {
            const optionLetter = optionKey.split('_')[1].toUpperCase();
            optionImages[optionLetter] = await uploadImageFromBase64(imageData, `option_${optionLetter}.jpg`);
          }
        }

        // Prepare question data
        const questionData = {
          subject: subject,
          question_text: question.question_text,
          question_image: questionImageUrl,
          question_type: question.question_type,
          marks: question.marks || 1,
          negative_marks: question.negative_marks || 0,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          explanation_image: explanationImageUrl,
          options: question.question_type === 'MCQ' ? {
            A: question.option_a,
            A_image: optionImages.A,
            B: question.option_b,
            B_image: optionImages.B,
            C: question.option_c,
            C_image: optionImages.C,
            D: question.option_d,
            D_image: optionImages.D
          } : null
        };

        questionsToUpload.push(questionData);
      }

      // Upload to database
      const { error } = await supabase
        .from('questions')
        .insert(questionsToUpload);

      if (error) {
        throw error;
      }

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${questionsToUpload.length} questions!`,
      });

      // Reset form
      setFile(null);
      setPreview([]);
      setSubject('');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel Question Upload
          </CardTitle>
          <CardDescription>
            Upload questions in bulk using Excel format. Supports both text and image content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj.code} value={subj.code}>
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Excel File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Preview ({preview.length} questions)</h4>
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !subject}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Questions'}
                </Button>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Question</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Correct Answer</th>
                      <th className="p-2 text-left">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((q, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{q.question_text.slice(0, 50)}...</td>
                        <td className="p-2">{q.question_type}</td>
                        <td className="p-2">{q.correct_answer}</td>
                        <td className="p-2">{q.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelQuestionUpload;
