
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Award, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { getAllSubjects } from "@/services/questionService";
import { supabase } from "@/integrations/supabase/client";

const subjects = [
  { id: 'CS', name: 'Computer Science & IT', duration: '3 hours', questions: 65, color: 'bg-blue-500' },
  { id: 'ME', name: 'Mechanical Engineering', duration: '3 hours', questions: 65, color: 'bg-green-500' },
  { id: 'EE', name: 'Electrical Engineering', duration: '3 hours', questions: 65, color: 'bg-purple-500' },
  { id: 'CE', name: 'Civil Engineering', duration: '3 hours', questions: 65, color: 'bg-orange-500' },
  { id: 'EC', name: 'Electronics & Communication', duration: '3 hours', questions: 65, color: 'bg-red-500' },
  { id: 'IN', name: 'Instrumentation Engineering', duration: '3 hours', questions: 65, color: 'bg-indigo-500' },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchAvailableSubjects = async () => {
      try {
        const subjects = await getAllSubjects();
        setAvailableSubjects(subjects);
        
        // Get question counts for each subject
        const counts: Record<string, number> = {};
        for (const subject of subjects) {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('subject', subject);
          counts[subject] = count || 0;
        }
        setQuestionCounts(counts);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchAvailableSubjects();
  }, []);

  const handleStartTest = (subjectId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate(`/exam/${subjectId}`);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Filter subjects to show only those with questions in database
  const filteredSubjects = subjects.filter(subject => 
    availableSubjects.includes(subject.id) && questionCounts[subject.id] > 0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                <p className="text-sm text-gray-500">Prepare for GATE with comprehensive mock tests</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700">Welcome, {user.email}</span>
                  {isAdmin && (
                    <Button
                      onClick={() => navigate('/admin')}
                      variant="outline"
                      size="sm"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Admin
                    </Button>
                  )}
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Master Your GATE Preparation</h2>
          <p className="text-xl mb-8 text-blue-100">
            Practice with authentic mock tests designed to simulate the real GATE experience
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">3 Hour Tests</h3>
              <p className="text-sm text-blue-100">Full-length practice sessions</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">65 Questions</h3>
              <p className="text-sm text-blue-100">Comprehensive question sets</p>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Detailed Analysis</h3>
              <p className="text-sm text-blue-100">Performance insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Subject</h2>
          <p className="text-gray-600">
            Select a subject to start your mock test. Each test includes 65 questions to be completed in 3 hours.
          </p>
        </div>

        {filteredSubjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Available</h3>
              <p className="text-gray-500 mb-4">
                There are no questions available for any subjects yet. 
                {isAdmin ? ' Please add questions through the admin panel.' : ' Please contact the administrator.'}
              </p>
              {isAdmin && (
                <Button onClick={() => navigate('/admin')}>
                  Go to Admin Panel
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                  </div>
                  <CardDescription>
                    Complete mock test for {subject.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{subject.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Questions:</span>
                      <span className="font-medium">{Math.min(questionCounts[subject.id] || 0, 65)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Available:</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {questionCounts[subject.id] || 0} questions
                      </Badge>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => handleStartTest(subject.id)}
                      disabled={!questionCounts[subject.id] || questionCounts[subject.id] === 0}
                    >
                      Start Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Navigation Cards */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/previous-tests')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Previous Tests</span>
                </CardTitle>
                <CardDescription>
                  Review your test history and detailed results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Test History
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/performance')}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Performance Analytics</span>
                </CardTitle>
                <CardDescription>
                  Track your progress and identify areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
      />
    </div>
  );
};

export default Index;
