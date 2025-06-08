
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const subjects = [
  { code: "CS", name: "Computer Science & Information Technology" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "EE", name: "Electrical Engineering" },
  { code: "CE", name: "Civil Engineering" },
  { code: "ECE", name: "Electronics & Communication" },
  { code: "CH", name: "Chemical Engineering" }
];

interface QuestionFormProps {
  formData: any;
  editingQuestion: any;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFormDataChange: (data: any) => void;
}

const QuestionForm = ({ formData, editingQuestion, loading, onSubmit, onCancel, onFormDataChange }: QuestionFormProps) => {
  const setFormData = (updater: any) => {
    if (typeof updater === 'function') {
      onFormDataChange(updater(formData));
    } else {
      onFormDataChange(updater);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
