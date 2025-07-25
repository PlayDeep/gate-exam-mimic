
import React from 'react';
import QuestionStats from './question/QuestionStats';
import QuestionActions from './question/QuestionActions';
import QuestionFormDialog from './question/QuestionFormDialog';
import QuestionManagerTabs from './question/QuestionManagerTabs';
import { useQuestionManager } from '@/hooks/useQuestionManager';
import { useQuestionForm } from '@/hooks/useQuestionForm';

const QuestionManager: React.FC = () => {
  console.log('QuestionManager: Rendering component');
  
  const {
    questions,
    loading,
    addSampleImageQuestion,
    handleDeleteAll,
    handleSubmit,
    handleDelete
  } = useQuestionManager();

  const {
    isDialogOpen,
    setIsDialogOpen,
    editingQuestion,
    formData,
    setFormData,
    handleAddQuestion,
    handleEdit,
    handleCancel
  } = useQuestionForm();

  console.log('QuestionManager: Questions loaded:', questions?.length || 0);
  console.log('QuestionManager: Loading state:', loading);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('QuestionManager: Submitting form with data:', formData);
    
    try {
      const success = await handleSubmit(formData, editingQuestion);
      if (success) {
        handleCancel();
      }
    } catch (error) {
      console.error('QuestionManager: Error submitting form:', error);
    }
  };

  if (loading && !questions.length) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <QuestionStats questionsCount={questions?.length || 0} />
        <QuestionActions
          onAddSample={addSampleImageQuestion}
          onAddQuestion={handleAddQuestion}
          onDeleteAll={handleDeleteAll}
          loading={loading}
          questions={questions || []}
        />
      </div>

      <QuestionFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingQuestion={editingQuestion}
        formData={formData}
        loading={loading}
        onSubmit={onSubmit}
        onCancel={handleCancel}
        onFormDataChange={setFormData}
      />

      <QuestionManagerTabs
        questions={questions || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default QuestionManager;
