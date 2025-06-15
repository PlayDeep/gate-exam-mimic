
import { useState } from 'react';

export const useConfirmationDialogs = () => {
  const [dialogs, setDialogs] = useState({
    clearAnswer: false,
    submitExam: false
  });

  const showDialog = (type: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [type]: true }));
  };

  const hideDialog = (type: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [type]: false }));
  };

  const hideAllDialogs = () => {
    setDialogs({
      clearAnswer: false,
      submitExam: false
    });
  };

  return {
    dialogs,
    showDialog,
    hideDialog,
    hideAllDialogs
  };
};
