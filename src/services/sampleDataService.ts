
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const addSampleImageQuestion = async (): Promise<void> => {
  const sampleQuestion = {
    subject: 'CS',
    question_text: 'Look at the following network diagram and identify the topology:',
    question_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop',
    question_type: 'MCQ',
    marks: 2,
    negative_marks: 0.5,
    correct_answer: 'B',
    explanation: 'This is a star topology where all nodes connect to a central hub.',
    explanation_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop',
    options: {
      A: { 
        text: 'Bus Topology',
        image: null
      },
      B: { 
        text: 'Star Topology',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop'
      },
      C: { 
        text: 'Ring Topology',
        image: null
      },
      D: { 
        text: 'Mesh Topology',
        image: null
      }
    }
  };

  const { error } = await supabase
    .from('questions')
    .insert([sampleQuestion]);

  if (error) throw error;

  toast({
    title: "Success",
    description: "Sample image-based question added successfully!"
  });
};
