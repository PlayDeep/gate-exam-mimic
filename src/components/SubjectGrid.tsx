
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllSubjects } from '@/services/questionService';

const subjects = [
  {
    code: "CS",
    name: "Computer Science & Information Technology",
    description: "Programming, Data Structures, Algorithms, Computer Networks",
    questions: 65,
    duration: "3 hours",
    color: "bg-blue-100 text-blue-800"
  },
  {
    code: "ME", 
    name: "Mechanical Engineering",
    description: "Thermodynamics, Fluid Mechanics, Machine Design",
    questions: 65,
    duration: "3 hours",
    color: "bg-green-100 text-green-800"
  },
  {
    code: "EE",
    name: "Electrical Engineering", 
    description: "Circuit Analysis, Power Systems, Control Systems",
    questions: 65,
    duration: "3 hours",
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    code: "CE",
    name: "Civil Engineering",
    description: "Structural Engineering, Geotechnical, Transportation",
    questions: 65,
    duration: "3 hours", 
    color: "bg-purple-100 text-purple-800"
  },
  {
    code: "ECE",
    name: "Electronics & Communication",
    description: "Digital Electronics, Communication Systems, Signal Processing",
    questions: 65,
    duration: "3 hours",
    color: "bg-red-100 text-red-800"
  },
  {
    code: "CH",
    name: "Chemical Engineering",
    description: "Process Engineering, Chemical Reaction, Mass Transfer",
    questions: 65,
    duration: "3 hours",
    color: "bg-indigo-100 text-indigo-800"
  }
];

const SubjectGrid = () => {
  const navigate = useNavigate();
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      console.log('Fetching available subjects for subject grid...');
      try {
        const subjects = await getAllSubjects();
        setAvailableSubjects(subjects);
        console.log('Available subjects in grid:', subjects);
      } catch (error) {
        console.error('Error fetching subjects for grid:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSubjects();
  }, []);

  const handleStartExam = (subjectCode: string) => {
    console.log('Starting exam for subject:', subjectCode);
    navigate(`/exam/${subjectCode.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => {
        const hasQuestions = availableSubjects.includes(subject.code);
        
        return (
          <Card key={subject.code} className={`transition-all duration-200 hover:shadow-lg ${!hasQuestions ? 'opacity-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <Badge className={subject.color}>{subject.code}</Badge>
              </div>
              <CardDescription className="text-sm">
                {subject.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{subject.questions} Questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{subject.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Mock Test Pattern</span>
              </div>

              {hasQuestions ? (
                <Button 
                  className="w-full" 
                  onClick={() => handleStartExam(subject.code)}
                >
                  Start Mock Test
                </Button>
              ) : (
                <div className="text-center">
                  <Button className="w-full" disabled>
                    No Questions Available
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Questions need to be added by admin
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SubjectGrid;
