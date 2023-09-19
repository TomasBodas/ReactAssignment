import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import './DurationChart.css'
interface Data1Item {
  Color: string;
  Duration: number | null;
  Id: string;
  TaskName: string;
}

interface Data2Item {
  Hour: number;
  JobTaskId: string;
  Override: {
    Duration: number;
  } | null;
}

interface DurationChartProps {
  data1: {
    data: Data1Item[];
  };
  data2: {
    Store: string;
    List: Data2Item[];
  };
}

const DurationChart: React.FC<DurationChartProps> = ({ data1, data2 }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [legendData, setLegendData] = useState<string[]>([]);
  const [activeLegendIndex, setActiveLegendIndex] = useState<number | null>(null);

  // Track active tasks with a boolean array
  const [activeTasks, setActiveTasks] = useState<boolean[]>(() =>
    Array(data1.data.length).fill(true)
  );

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current;

      // Create an array to store aggregated durations for each hour (0 to 23)
      const aggregatedDurationsByHour = Array.from({ length: 24 }, () =>
        Array(data1.data.length).fill(0)
      );

      // Loop through data2 and accumulate durations by hour and task
      data2.List.forEach(item => {
        const hour = item.Hour;
        const duration = item.Override?.Duration || 0;
        const dataIndex = data1.data.findIndex(item1 => item1.Id === item.JobTaskId);
        if (dataIndex !== -1 && activeTasks[dataIndex]) {
          aggregatedDurationsByHour[hour][dataIndex] += duration;
        }
      });

      // Extract legend data (TaskNames) for custom legend
      const legendData = data1.data.map(item => item.TaskName);
      setLegendData(legendData);

      // Destroy the existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({ length: 24 }, (_, i) => i.toString()), // Labels from 0 to 23
          datasets: data1.data.map((item1, dataIndex) => ({
            label: item1.TaskName,
            data: aggregatedDurationsByHour.map(hoursData => hoursData[dataIndex]),
            backgroundColor: item1.Color,
          })),
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              stacked: true, // Enable stacking on the Y-axis
              title: {
                display: true,
                text: 'Minutes',
              },
              ticks: {
                stepSize: 60, // Set the step size to 60
                callback: (value) => value + ' 分', // Add '分' symbol
              },
            },
            x: {
              stacked: true, // Enable stacking on the X-axis
              title: {
                display: true,
                text: 'Hours',
              },
              
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          
          onHover: (event, elements) => {
            if (elements.length > 0) {
              setActiveLegendIndex(elements[0].index);
            } else {
              setActiveLegendIndex(null);
            }
          },
        },
      });
    }
  }, [data1, data2, activeTasks]);

  // Toggle the active state of a task when its legend item is clicked
  const toggleTask = (index: number) => {
    const newActiveTasks = [...activeTasks];
    newActiveTasks[index] = !newActiveTasks[index];
    setActiveTasks(newActiveTasks);
  };

  const toggleAllTrue = () => {
    setActiveTasks(Array(data1.data.length).fill(true));
  };

  const toggleAllFalse = () => {
    setActiveTasks(Array(data1.data.length).fill(false));
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      <div className="chart-container" style={{ flex: '3 1 0' }}>
        <canvas ref={chartRef}></canvas>
      </div>
      <div className="legend-container" style={{ flex: '1 1 0', height: '572px' }}>
        <div className="custom-legend">
          <div className="legend-controls">
            <button
              className="legend-button"
              onClick={toggleAllTrue}
            >
              一括選択
            </button>
            <button
              className="legend-button"
              onClick={toggleAllFalse}
            >
              一括解除
            </button>
          </div>
          <div className="legend-items">
            {legendData.map((taskName, index) => (
              <div
                key={index}
                className={`legend-item ${activeTasks[index] ? 'active' : 'inactive'}`}
                onClick={() => {
                  toggleTask(index);
                  setActiveLegendIndex(activeTasks[index] ? null : index);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* Use an SVG element for the circular legend color */}
                <svg width="20" height="20">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill={data1.data[index].Color}
                  />
                </svg>
                <span style={{ textDecoration: activeTasks[index] ? 'none' : 'line-through' }}>
                  {taskName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DurationChart;