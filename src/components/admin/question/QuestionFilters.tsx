
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const subjects = [
  { code: "CS", name: "Computer Science & IT" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "EE", name: "Electrical Engineering" },
  { code: "CE", name: "Civil Engineering" },
  { code: "ECE", name: "Electronics & Communication" },
  { code: "CH", name: "Chemical Engineering" }
];

interface QuestionFiltersProps {
  filters: {
    subject: string;
    questionType: string;
    marks: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

const QuestionFilters = ({ filters, onFilterChange, onClearFilters }: QuestionFiltersProps) => {
  const hasActiveFilters = filters.subject || filters.questionType || filters.marks;

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Filters:</span>
        
        <Select value={filters.subject} onValueChange={(value) => onFilterChange('subject', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.code} value={subject.code}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.questionType} onValueChange={(value) => onFilterChange('questionType', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="MCQ">MCQ</SelectItem>
            <SelectItem value="NAT">NAT</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.marks} onValueChange={(value) => onFilterChange('marks', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Marks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Marks</SelectItem>
            <SelectItem value="1">1 Mark</SelectItem>
            <SelectItem value="2">2 Marks</SelectItem>
            <SelectItem value="3">3 Marks</SelectItem>
            <SelectItem value="4">4 Marks</SelectItem>
            <SelectItem value="5">5 Marks</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionFilters;
