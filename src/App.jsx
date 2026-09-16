import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  //Fetch Jobs
  const fetchJobs = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await axios.get('https://mini-job-queue-dashboard-backend.onrender.com/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  //  Create Job
  const createJob = async () => {
    try {
      await axios.post('https://mini-job-queue-dashboard-backend.onrender.com/jobs', {
        title: "Test Job " + Math.floor(Math.random() * 1000),
        type: "Data Processing"
      });
      fetchJobs(true);
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job.");
    }
  };

  //  Update Job Status (Manual Control)
  const updateJobStatus = async (id, newStatus) => {
    try {
      await axios.patch(`https://mini-job-queue-dashboard-backend.onrender.com/jobs/${id}/status`, {
        status: newStatus
      });
      fetchJobs(true);
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response && error.response.data.message) {
        alert(`Update Failed: ${error.response.data.message}`);
      } else {
        alert("Failed to update job status.");
      }
    }
  };

  // Delete Job
  const deleteJob = async (id) => {
    // Simple confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await axios.delete(`https://mini-job-queue-dashboard-backend.onrender.com/jobs/${id}`);
      fetchJobs(true);
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job.");
    }
  };

 useEffect(() => {
    fetchJobs(); 
  }, []);


  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  const counts = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === 'pending').length,
    running: jobs.filter(job => job.status === 'running').length,
    completed: jobs.filter(job => job.status === 'completed').length,
    failed: jobs.filter(job => job.status === 'failed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-8 border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Job Queue Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={() => fetchJobs(true)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition font-medium">
              Refresh
            </button>
            <button onClick={createJob} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium">
              + Create Job
            </button>
          </div>
        </header>

        {/* Stats & Filters Section */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex gap-4 text-sm font-medium">
            <span className="text-gray-600">Total: {counts.total}</span>
            <span className="text-yellow-600">Pending: {counts.pending}</span>
            <span className="text-blue-600">Running: {counts.running}</span>
            <span className="text-green-600">Completed: {counts.completed}</span>
            <span className="text-red-600">Failed: {counts.failed}</span>
          </div>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Show All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="running">Running Only</option>
            <option value="completed">Completed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>

        {/* Main Content Area */}
        <main className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading jobs from server...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No jobs found matching the current filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 hover:bg-gray-100 transition">
                  
                  {/* Job Details */}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg text-gray-800">Job #{job.id}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                        ${job.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : ''}
                        ${job.status === 'running' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
                        ${job.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                        ${job.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
                      `}>
                        {job.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{job.title}</p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {job.status === 'pending' && (
                      <button onClick={() => updateJobStatus(job.id, 'running')} className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium transition">
                        Start Job
                      </button>
                    )}
                    {job.status === 'running' && (
                      <>
                        <button onClick={() => updateJobStatus(job.id, 'completed')} className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium transition">
                          Complete
                        </button>
                        <button onClick={() => updateJobStatus(job.id, 'failed')} className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition">
                          Fail
                        </button>
                      </>
                    )}
                    
                    {/* Delete button is always available */}
                    <button onClick={() => deleteJob(job.id)} className="px-3 py-1 bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white rounded text-sm font-medium transition ml-2">
                      Delete
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default App;