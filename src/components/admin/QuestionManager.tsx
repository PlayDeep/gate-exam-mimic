import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ExcelQuestionUpload from './ExcelQuestionUpload';

interface Question {
  id: string;
  subject: string;
  question_text: string;
  options?: any;
  correct_answer: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  explanation?: string;
}

const subjects = [
  { code: "CS", name: "Computer Science & Information Technology" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "EE", name: "Electrical Engineering" },
  { code: "CE", name: "Civil Engineering" },
  { code: "ECE", name: "Electronics & Communication" },
  { code: "CH", name: "Chemical Engineering" }
];

const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    question_text: '',
    question_type: 'MCQ',
    marks: 1,
    negative_marks: 0,
    correct_answer: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    explanation: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive"
      });
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const questionData = {
      subject: formData.subject,
      question_text: formData.question_text,
      question_type: formData.question_type,
      marks: formData.marks,
      negative_marks: formData.negative_marks,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation,
      options: formData.question_type === 'MCQ' ? {
        A: formData.option_a,
        B: formData.option_b,
        C: formData.option_c,
        D: formData.option_d
      } : null
    };

    let result;
    if (editingQuestion) {
      result = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', editingQuestion.id);
    } else {
      result = await supabase
        .from('questions')
        .insert([questionData]);
    }

    if (result.error) {
      toast({
        title: "Error",
        description: `Failed to ${editingQuestion ? 'update' : 'create'} question`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully!`
      });
      setIsDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Question deleted successfully!"
      });
      fetchQuestions();
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      subject: question.subject,
      question_text: question.question_text,
      question_type: question.question_type,
      marks: question.marks,
      negative_marks: question.negative_marks,
      correct_answer: question.correct_answer,
      option_a: question.options?.A || '',
      option_b: question.options?.B || '',
      option_c: question.options?.C || '',
      option_d: question.options?.D || '',
      explanation: question.explanation || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      question_text: '',
      question_type: 'MCQ',
      marks: 1,
      negative_marks: 0,
      correct_answer: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      explanation: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Question Manager</h2>
          <p className="text-gray-600">Add and manage test questions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingQuestion(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.code} value={subject.code}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="question_type">Question Type</Label>
                  <Select value={formData.question_type} onValueChange={(value) => setFormData(prev => ({ ...prev, question_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="NAT">Numerical Answer Type (NAT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question_text">Question Text</Label>
                <Textarea
                  id="question_text"
                  placeholder="Enter the question text"
                  value={formData.question_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                  required
                />
              </div>

              {formData.question_type === 'MCQ' && (
                <div className="space-y-4">
                  <Label>Options</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="option_a">Option A</Label>
                      <Input
                        id="option_a"
                        placeholder="Enter option A"
                        value={formData.option_a}
                        onChange={(e) => setFormData(prev => ({ ...prev, option_a: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option_b">Option B</Label>
                      <Input
                        id="option_b"
                        placeholder="Enter option B"
                        value={formData.option_b}
                        onChange={(e) => setFormData(prev => ({ ...prev, option_b: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option_c">Option C</Label>
                      <Input
                        id="option_c"
                        placeholder="Enter option C"
                        value={formData.option_c}
                        onChange={(e) => setFormData(prev => ({ ...prev, option_c: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option_d">Option D</Label>
                      <Input
                        id="option_d"
                        placeholder="Enter option D"
                        value={formData.option_d}
                        onChange={(e) => setFormData(prev => ({ ...prev, option_d: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correct_answer">Correct Answer</Label>
                  <Input
                    id="correct_answer"
                    placeholder={formData.question_type === 'MCQ' ? "A, B, C, or D" : "Numerical value"}
                    value={formData.correct_answer}
                    onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, marks: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="negative_marks">Negative Marks</Label>
                  <Input
                    id="negative_marks"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.negative_marks}
                    onChange={(e) => setFormData(prev => ({ ...prev, negative_marks: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Enter explanation for the answer"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="excel">Excel Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questions.length})</CardTitle>
              <CardDescription>Manage all test questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {question.subject}
                          </span>
                          <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {question.question_type}
                          </span>
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            {question.marks} marks
                          </span>
                        </div>
                        <p className="text-gray-900 mb-2">{question.question_text}</p>
                        {question.options && (
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>A) {question.options.A}</div>
                            <div>B) {question.options.B}</div>
                            <div>C) {question.options.C}</div>
                            <div>D) {question.options.D}</div>
                          </div>
                        )}
                        <p className="text-sm font-medium text-green-600 mt-2">
                          Correct Answer: {question.correct_answer}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(question)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(question.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="excel">
          <ExcelQuestionUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionManager;
