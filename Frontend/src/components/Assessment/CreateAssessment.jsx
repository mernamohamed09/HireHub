import React, { useState } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, Trash2, Save } from 'lucide-react';

const CreateAssessment = ({ jobId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    passingScore: 50,
  });

  const [questions, setQuestions] = useState([
    {
      type: 'mcq',
      text: '',
      maxScore: 100,
      options: ['', '', '', ''],
      correctAnswer: '',
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { type: 'mcq', text: '', maxScore: 10, options: ['', ''], correctAnswer: '' }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    
    // Reset specific fields when type changes
    if (field === 'type') {
      if (value === 'mcq') {
        newQs[index].options = ['', ''];
        newQs[index].correctAnswer = '';
      }
      if (value === 'truefalse') newQs[index].correctAnswer = 'True';
      if (value === 'written') newQs[index].modelAnswer = '';
      if (value === 'coding') {
        newQs[index].allowedLanguages = ['javascript'];
        newQs[index].codeTemplate = '';
        newQs[index].testCases = [{ input: '', expectedOutput: '' }];
      }
    }
    setQuestions(newQs);
  };

  const handleMcqOptionChange = (qIndex, optIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].options[optIndex] = value;
    setQuestions(newQs);
  };

  const handleTestCaseChange = (qIndex, tIndex, field, value) => {
    const newQs = [...questions];
    newQs[qIndex].testCases[tIndex][field] = value;
    setQuestions(newQs);
  };

  const addTestCase = (qIndex) => {
    const newQs = [...questions];
    newQs[qIndex].testCases.push({ input: '', expectedOutput: '' });
    setQuestions(newQs);
  };

  const removeTestCase = (qIndex, tIndex) => {
    const newQs = [...questions];
    newQs[qIndex].testCases.splice(tIndex, 1);
    setQuestions(newQs);
  };

  const validatePayload = () => {
    const totalScore = questions.reduce((sum, q) => sum + (Number(q.maxScore) || 0), 0);
    if (formData.passingScore > totalScore) {
      toast.error(`Passing score (${formData.passingScore}) cannot be greater than the total score of all questions (${totalScore}).`);
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.type === 'mcq') {
        if (!q.options.includes(q.correctAnswer)) {
          toast.error(`Question ${i + 1}: Correct answer must exactly match one of the options.`);
          return false;
        }
      }
      if (q.type === 'coding') {
        if (!q.testCases || q.testCases.length === 0) {
          toast.error(`Question ${i + 1}: Coding questions require at least one test case.`);
          return false;
        }
        for (let j = 0; j < q.testCases.length; j++) {
          const tc = q.testCases[j];
          if (!tc.input.trim() || !tc.expectedOutput.trim()) {
            toast.error(`Question ${i + 1}: Test cases cannot be empty.`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePayload()) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        questions
      };

      const response = await api.post(`/jobs/${jobId}/assessments`, payload);

      toast.success('Assessment created successfully!');
      if (onSuccess) onSuccess(response.data.assessment);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Assessment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Assessment Title</label>
            <input 
              type="text" required
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 p-2 border"
              placeholder="e.g. Frontend Tech Round"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
            <input 
              type="number" required min="1"
              value={formData.duration} 
              onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
            <input 
              type="number" required min="1" max="100"
              value={formData.passingScore} 
              onChange={(e) => setFormData({...formData, passingScore: Number(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
            <button 
              type="button" 
              onClick={handleAddQuestion}
              className="flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Question
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 border rounded-md bg-gray-50 relative">
                <button 
                  type="button" 
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Question Text</label>
                    <input 
                      type="text" required
                      value={q.text} 
                      onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select 
                      value={q.type} 
                      onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-2 border"
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="truefalse">True/False</option>
                      <option value="written">Written (AI Graded)</option>
                      <option value="coding">Coding</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Max Score</label>
                  <input 
                    type="number" required min="1"
                    value={q.maxScore} 
                    onChange={(e) => handleQuestionChange(qIndex, 'maxScore', Number(e.target.value))}
                    className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm text-gray-900 p-2 border"
                  />
                </div>

                {/* Type specific fields */}
                {q.type === 'mcq' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    {q.options?.map((opt, oIndex) => (
                      <input 
                        key={oIndex} type="text" required
                        value={opt} 
                        onChange={(e) => handleMcqOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-2 border"
                      />
                    ))}
                    <button 
                      type="button" 
                      onClick={() => handleQuestionChange(qIndex, 'options', [...q.options, ''])}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add Option
                    </button>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                      <select 
                        required
                        value={q.correctAnswer || ''} 
                        onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-2 border bg-white"
                      >
                        <option value="" disabled>Select correct answer...</option>
                        {q.options?.filter(opt => opt.trim() !== '').map((opt, oIndex) => (
                          <option key={oIndex} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {q.type === 'truefalse' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                    <select 
                      value={q.correctAnswer || 'True'} 
                      onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                      className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm text-gray-900 p-2 border"
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  </div>
                )}

                {q.type === 'written' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model Answer (Used for AI Grading)</label>
                    <textarea 
                      required rows="3"
                      value={q.modelAnswer || ''} 
                      onChange={(e) => handleQuestionChange(qIndex, 'modelAnswer', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-2 border"
                    ></textarea>
                  </div>
                )}

                {q.type === 'coding' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Code Template</label>
                      <textarea 
                        rows="3"
                        value={q.codeTemplate || ''} 
                        onChange={(e) => handleQuestionChange(qIndex, 'codeTemplate', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-2 border font-mono text-sm"
                        placeholder="function solution() { ... }"
                      ></textarea>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Test Cases</label>
                        <button 
                          type="button" 
                          onClick={() => addTestCase(qIndex)}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                        >
                          + Add Test Case
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {q.testCases?.map((tc, tIndex) => (
                          <div key={tIndex} className="flex gap-2 items-start bg-white p-2 border rounded">
                            <div className="flex-1 space-y-2">
                              <div>
                                <label className="block text-xs text-gray-500">Input</label>
                                <input 
                                  type="text" required
                                  value={tc.input} 
                                  onChange={(e) => handleTestCaseChange(qIndex, tIndex, 'input', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-1 text-sm border font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500">Expected Output</label>
                                <input 
                                  type="text" required
                                  value={tc.expectedOutput} 
                                  onChange={(e) => handleTestCaseChange(qIndex, tIndex, 'expectedOutput', e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900 p-1 text-sm border font-mono"
                                />
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeTestCase(qIndex, tIndex)}
                              className="text-red-500 hover:text-red-700 pt-6"
                              disabled={q.testCases.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : <><Save className="w-4 h-4 mr-2" /> Save Assessment</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssessment;
