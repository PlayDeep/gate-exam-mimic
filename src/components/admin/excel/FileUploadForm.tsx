
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const subjects = [
  { code: "CS", name: "Computer Science & Information Technology" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "EE", name: "Electrical Engineering" },
  { code: "CE", name: "Civil Engineering" },
  { code: "ECE", name: "Electronics & Communication" },
  { code: "CH", name: "Chemical Engineering" }
];

interface FileUploadFormProps {
  subject: string;
  onSubjectChange: (value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadForm = ({ subject, onSubjectChange, onFileChange }: FileUploadFormProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select value={subject} onValueChange={onSubjectChange}>
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
          onChange={onFileChange}
        />
      </div>
    </div>
  );
};

export default FileUploadForm;
