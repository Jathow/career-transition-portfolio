import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TimelineData {
  labels: string[];
  progress: number[];
  deadlines: string[];
  overdue: boolean[];
}

interface ProjectTimelineProps {
  userId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ userId }) => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTimelineData();
  }, [userId]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Sign in to view your timeline');
        return;
      }

      const response = await fetch('/api/time-tracking/timeline', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timeline data');
      }

      const result = await response.json();
      setTimelineData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!timelineData || timelineData.labels.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No projects yet. Create a project to see your timeline.</p>
      </div>
    );
  }

  const chartData = {
    labels: timelineData.labels,
    datasets: [
      {
        label: 'Progress (%)',
        data: timelineData.progress,
        backgroundColor: timelineData.overdue.map(isOverdue => 
          isOverdue ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)'
        ),
        borderColor: timelineData.overdue.map(isOverdue => 
          isOverdue ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
        ),
        borderWidth: 1,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Project Progress Timeline',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const index = context.dataIndex;
            const deadline = timelineData.deadlines[index];
            const isOverdue = timelineData.overdue[index];
            return [
              `Deadline: ${deadline}`,
              isOverdue ? 'Status: Overdue' : 'Status: On Track'
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Progress (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Projects'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Project Timeline</h2>
        <p className="text-gray-600 text-sm">
          Visualize your project progress and deadlines
        </p>
      </div>
      
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span>On Track</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span>Overdue</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline; 