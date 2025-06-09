
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import TemplateDownload from './excel/TemplateDownload';
import FileUploadForm from './excel/FileUploadForm';
import QuestionPreview from './excel/QuestionPreview';

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
        console.error('Parse error:', error);
        toast({
          title: "Parse Error",
          description: "Failed to parse Excel file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
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
      console.log('Starting upload process...');
      const questionsToUpload = [];

      for (const question of preview) {
        console.log('Processing question:', question.question_text);
        
        const questionData = {
          subject: subject,
          question_text: question.question_text,
          question_type: question.question_type,
          marks: question.marks || 1,
          negative_marks: question.negative_marks || 0,
          correct_answer: question.correct_answer,
          explanation: question.explanation || null,
          question_image: question.question_image || null,
          explanation_image: question.explanation_image || null,
          options: question.question_type === 'MCQ' ? {
            A: { 
              text: question.option_a || '',
              image: question.option_a_image || null
            },
            B: { 
              text: question.option_b || '',
              image: question.option_b_image || null
            },
            C: { 
              text: question.option_c || '',
              image: question.option_c_image || null
            },
            D: { 
              text: question.option_d || '',
              image: question.option_d_image || null
            }
          } : null
        };

        questionsToUpload.push(questionData);
      }

      console.log('Uploading questions to database...', questionsToUpload);

      const { data, error } = await supabase
        .from('questions')
        .insert(questionsToUpload)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${questionsToUpload.length} questions with image support!`,
      });

      setFile(null);
      setPreview([]);
      setSubject('');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload questions: ${error.message || 'Unknown error'}`,
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
            Upload questions in bulk using Excel format. Supports image URLs for questions, options, and explanations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TemplateDownload />

          <FileUploadForm
            subject={subject}
            onSubjectChange={setSubject}
            onFileChange={handleFileChange}
          />

          <QuestionPreview
            preview={preview}
            subject={subject}
            uploading={uploading}
            onUpload={handleUpload}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelQuestionUpload;
