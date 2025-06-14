
import React from 'react';
import QuestionStats from './question/QuestionStats';
import QuestionActions from './question/QuestionActions';
import QuestionFormDialog from './question/QuestionFormDialog';
import QuestionManagerTabs from './question/QuestionManagerTabs';
import { useQuestionManager } from '@/hooks/useQuestionManager';
import { useQuestionForm } from '@/hooks/useQuestionForm';

const QuestionManager: React.FC = () => {
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit(formData, editingQuestion);
    if (success) {
      handleCancel();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <QuestionStats questionsCount={questions.length} />
        <QuestionActions
          onAddSample={addSampleImageQuestion}
          onAddQuestion={handleAddQuestion}
          onDeleteAll={handleDeleteAll}
          loading={loading}
          questions={questions}
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
        questions={questions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default QuestionManager;
