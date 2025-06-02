
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Calculator, Award, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const subjects = [
  {
    code: "CS",
    name: "Computer Science & Information Technology",
    questions: 65,
    duration: "3 hours",
    color: "bg-blue-500",
    icon: "💻"
  },
  {
    code: "ME", 
    name: "Mechanical Engineering",
    questions: 65,
    duration: "3 hours", 
    color: "bg-green-500",
    icon: "⚙️"
  },
  {
    code: "EE",
    name: "Electrical Engineering", 
    questions: 65,
    duration: "3 hours",
    color: "bg-yellow-500", 
    icon: "⚡"
  },
  {
    code: "CE",
    name: "Civil Engineering",
    questions: 65,
    duration: "3 hours",
    color: "bg-purple-500",
    icon: "🏗️"
  },
  {
    code: "ECE",
    name: "Electronics & Communication",
    questions: 65, 
    duration: "3 hours",
    color: "bg-red-500",
    icon: "📡"
  },
  {
    code: "CH",
    name: "Chemical Engineering",
    questions: 65,
    duration: "3 hours",
    color: "bg-indigo-500", 
    icon: "🧪"
  }
];

const features = [
  {
    icon: Clock,
    title: "Real-time Timer",
    description: "Exact GATE exam timing with auto-submit functionality"
  },
  {
    icon: Calculator,
    title: "Virtual Calculator", 
    description: "Built-in scientific calculator just like in GATE"
  },
  {
    icon: BookOpen,
    title: "Question Navigation",
    description: "Easy navigation between questions with marking system"
  },
  {
    icon: Award,
    title: "Detailed Analysis",
    description: "Comprehensive performance analysis and explanations"
  }
];

const stats = [
  { label: "Mock Tests Taken", value: "50,000+", icon: Users },
  { label: "Average Score Improvement", value: "25%", icon: TrendingUp },
  { label: "Success Rate", value: "87%", icon: Award }
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState("");

  const handleStartTest = () => {
    if (selectedSubject) {
      navigate(`/exam/${selectedSubject}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GATE Mock Test</h1>
                <p className="text-sm text-gray-500">Graduate Aptitude Test in Engineering</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Previous Tests</Button>
              <Button variant="outline">Performance</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Practice Like the Real GATE Exam
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the exact interface, timing, and question patterns of the actual GATE examination. 
            Boost your preparation with our comprehensive mock test platform.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subject Selection */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Subject</h3>
            <p className="text-lg text-gray-600">Select your engineering discipline to start the mock test</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {subjects.map((subject) => (
              <Card 
                key={subject.code}
                className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                  selectedSubject === subject.code ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedSubject(subject.code)}
              >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-3">{subject.icon}</div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription>
                    {subject.questions} Questions • {subject.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className={`w-full h-2 ${subject.color} rounded-full mb-4`}></div>
                  <p className="text-sm text-gray-500">Full Length Mock Test</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="px-8 py-3 text-lg"
              disabled={!selectedSubject}
              onClick={handleStartTest}
            >
              Start Mock Test
            </Button>
            {selectedSubject && (
              <p className="text-sm text-gray-500 mt-2">
                You selected: {subjects.find(s => s.code === selectedSubject)?.name}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Exam Features</h3>
            <p className="text-lg text-gray-600">Everything you need for authentic GATE exam practice</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Test Instructions</h3>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-blue-600">General Instructions</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Total duration: 3 hours (180 minutes)</li>
                    <li>• Total questions: 65 (varies by subject)</li>
                    <li>• Multiple Choice Questions (MCQs) and Numerical Answer Type (NAT)</li>
                    <li>• Use the virtual calculator provided</li>
                    <li>• Auto-submit when time expires</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-blue-600">Marking Scheme</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• MCQ: +1 or +2 marks for correct answer</li>
                    <li>• MCQ: -1/3 or -2/3 marks for wrong answer</li>
                    <li>• NAT: +1 or +2 marks for correct answer</li>
                    <li>• NAT: No negative marking</li>
                    <li>• Unanswered questions: 0 marks</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">© 2024 GATE Mock Test Platform. All rights reserved.</p>
            <p className="text-sm text-gray-500 mt-2">Practice responsibly. Good luck with your GATE preparation!</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
