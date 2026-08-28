import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const AssessmentStatusView = ({ invitationId, applicationId, initialStatus = null }) => {
  // KNOWN LIMITATION: initialStatus represents the last known local state from the background poller (updates every 30s).
  // If a candidate acts immediately after an invite, this might show 'not_started' for up to 30 seconds until the next poll,
  // unless the recruiter manually clicks the 'Refresh Status' button below which does a live fetch.
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(initialStatus);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/invitations/${invitationId}/result`);
      setResult(response.data.result);
      toast.success('Assessment status updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch assessment status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!result) return { text: 'Unknown', icon: <AlertCircle className="w-5 h-5 text-gray-400" />, color: 'text-gray-500' };

    switch (result.status) {
      case 'not_started':
        return { text: 'Invitation sent, not yet opened', icon: <Clock className="w-5 h-5 text-gray-500" />, color: 'text-gray-600' };
      case 'registered':
        return { text: 'Registered, pending start', icon: <Clock className="w-5 h-5 text-blue-500" />, color: 'text-blue-600' };
      case 'in_progress':
        return { text: 'Currently taking exam', icon: <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />, color: 'text-yellow-600' };
      case 'grading':
        return { text: 'Submitted, awaiting grading', icon: <Clock className="w-5 h-5 text-purple-500" />, color: 'text-purple-600' };
      case 'completed':
        return { 
          text: `Completed: ${result.score}% - ${result.passed ? 'Passed' : 'Failed'}`, 
          icon: result.passed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />, 
          color: result.passed ? 'text-green-600' : 'text-red-600' 
        };
      case 'error':
        return { text: 'System Error / Abandoned', icon: <AlertCircle className="w-5 h-5 text-red-500" />, color: 'text-red-600' };
      default:
        return { text: result.status, icon: <AlertCircle className="w-5 h-5 text-gray-400" />, color: 'text-gray-600' };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex items-center space-x-3">
        {display.icon}
        <div>
          <p className="text-sm font-medium text-gray-700">RavenACE Assessment</p>
          <p className={`text-sm font-semibold ${display.color}`}>
            {result ? display.text : 'Click refresh to load status'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <button 
          onClick={fetchStatus} 
          disabled={loading}
          className="flex items-center justify-center px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        
        {result && result.status === 'completed' && applicationId && (
          <Link
            to={`/company/applications/${applicationId}/results`}
            className="flex items-center justify-center px-3 py-1.5 text-xs bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 text-blue-700 font-medium transition-colors"
          >
            View Results
          </Link>
        )}
      </div>
    </div>
  );
};

export default AssessmentStatusView;
