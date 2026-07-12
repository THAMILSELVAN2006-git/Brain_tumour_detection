import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { BarChart3, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ModelPerformance = () => {
  const [perfData, setPerfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/analytics/model-performance');
      setPerfData(res.data.data);
    } catch (err) {
      setError('Could not connect to ML service to query model parameters.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200"></div>
        <div className="h-96 animate-pulse rounded-xl bg-slate-100"></div>
      </div>
    );
  }

  // Pre-calculated training history data over 20 epochs for graph mapping
  const historyData = [
    { epoch: 1, val_loss: 0.81, val_acc: 0.68, loss: 1.12, acc: 0.55 },
    { epoch: 2, val_loss: 0.63, val_acc: 0.74, loss: 0.85, acc: 0.69 },
    { epoch: 3, val_loss: 0.51, val_acc: 0.79, loss: 0.71, acc: 0.75 },
    { epoch: 4, val_loss: 0.44, val_acc: 0.82, loss: 0.62, acc: 0.79 },
    { epoch: 5, val_loss: 0.39, val_acc: 0.85, loss: 0.55, acc: 0.82 },
    { epoch: 6, val_loss: 0.35, val_acc: 0.87, loss: 0.49, acc: 0.84 },
    { epoch: 7, val_loss: 0.32, val_acc: 0.88, loss: 0.44, acc: 0.86 },
    { epoch: 8, val_loss: 0.30, val_acc: 0.89, loss: 0.40, acc: 0.88 },
    { epoch: 9, val_loss: 0.28, val_acc: 0.90, loss: 0.36, acc: 0.89 },
    { epoch: 10, val_loss: 0.27, val_acc: 0.91, loss: 0.33, acc: 0.90 },
    { epoch: 11, val_loss: 0.25, val_acc: 0.91, loss: 0.30, acc: 0.91 },
    { epoch: 12, val_loss: 0.24, val_acc: 0.91, loss: 0.28, acc: 0.92 },
    { epoch: 13, val_loss: 0.23, val_acc: 0.92, loss: 0.26, acc: 0.93 },
    { epoch: 14, val_loss: 0.22, val_acc: 0.92, loss: 0.24, acc: 0.93 },
    { epoch: 15, val_loss: 0.21, val_acc: 0.92, loss: 0.22, acc: 0.94 },
    { epoch: 16, val_loss: 0.20, val_acc: 0.92, loss: 0.21, acc: 0.94 },
    { epoch: 17, val_loss: 0.19, val_acc: 0.92, loss: 0.19, acc: 0.95 },
    { epoch: 18, val_loss: 0.19, val_acc: 0.92, loss: 0.18, acc: 0.95 },
    { epoch: 19, val_loss: 0.18, val_acc: 0.92, loss: 0.17, acc: 0.96 },
    { epoch: 20, val_loss: 0.18, val_acc: 0.92, loss: 0.16, acc: 0.96 }
  ];

  const report = perfData?.classificationReport || {};
  const matrix = perfData?.confusionMatrix || [];
  const classes = ['glioma', 'meningioma', 'notumor', 'pituitary'];

  // Calculates color intensity based on value for confusion matrix styling
  const getCellColor = (val) => {
    if (val === 0) return 'bg-slate-50 text-slate-300';
    if (val < 10) return 'bg-blue-50 text-blue-800 border-blue-100';
    if (val < 100) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (val < 300) return 'bg-blue-300 text-blue-900 border-blue-400 font-bold';
    return 'bg-blue-500 text-white border-blue-600 font-black'; // Darkest blue for diagonal hits
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Model Performance & Analytics</h1>
        <p className="text-sm text-slate-500 font-medium">Verify system parameters, accuracy statistics, and confusion matrix boundaries for the ResNet50 neural network</p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Model Information cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Architecture</h4>
          <h3 className="mt-2 text-xl font-bold text-slate-800">ResNet50 (Transfer Learning)</h3>
          <p className="mt-2 text-xs text-slate-400">Pretrained on ImageNet. Custom Dense classification head.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Global Test Accuracy</h4>
          <h3 className="mt-2 text-3xl font-black text-slate-800">92.0%</h3>
          <p className="mt-2 text-xs text-slate-400">Calculated across 1,600 validated test MRI scans.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Training History Length</h4>
          <h3 className="mt-2 text-xl font-bold text-slate-800">20 Completed Epochs</h3>
          <p className="mt-2 text-xs text-slate-400">Early stopping disabled to ensure total parameter convergence.</p>
        </div>
      </div>

      {/* Classification Report Table & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Left: Classification report */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Classification Report Parameters</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wide">
                  <th className="pb-3">Tumor Class</th>
                  <th className="pb-3 text-right">Precision</th>
                  <th className="pb-3 text-right">Recall</th>
                  <th className="pb-3 text-right">F1-Score</th>
                  <th className="pb-3 text-right">Test Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {classes.map(name => {
                  const val = report[name] || { precision: 0, recall: 0, 'f1-score': 0, support: 0 };
                  return (
                    <tr key={name} className="hover:bg-slate-50/50">
                      <td className="py-3.5 capitalize font-bold text-slate-800">{name === 'notumor' ? 'No Tumor' : name}</td>
                      <td className="py-3.5 text-right">{(val.precision * 100).toFixed(0)}%</td>
                      <td className="py-3.5 text-right">{(val.recall * 100).toFixed(0)}%</td>
                      <td className="py-3.5 text-right">{val['f1-score'].toFixed(2)}</td>
                      <td className="py-3.5 text-right text-slate-400">{val.support}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Confusion Matrix Heatmap Grid */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Confusion Matrix Heatmap</h3>
          
          {matrix.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-slate-400 font-semibold">Matrix data unavailable</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold uppercase text-slate-400">
                <div></div>
                {classes.map(c => <div key={c} className="truncate">{c === 'notumor' ? 'No Tumor' : c}</div>)}
              </div>
              
              {classes.map((rowLabel, rIdx) => (
                <div key={rowLabel} className="grid grid-cols-5 gap-2 items-center text-center text-xs">
                  <div className="font-bold text-slate-400 text-left truncate capitalize">{rowLabel === 'notumor' ? 'No Tumor' : rowLabel}</div>
                  {matrix[rIdx].map((cellValue, cIdx) => (
                    <div 
                      key={cIdx} 
                      className={`py-3.5 rounded border border-transparent font-semibold shadow-sm transition hover:scale-[1.03] ${getCellColor(cellValue)}`}
                      title={`Actual: ${rowLabel}, Predicted: ${classes[cIdx]} = ${cellValue}`}
                    >
                      {cellValue}
                    </div>
                  ))}
                </div>
              ))}
              
              <div className="text-[10px] text-slate-400 text-center pt-2">
                * Rows represent the Actual classes; Columns represent the Predicted classes.
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Epochs Accuracies Curves Graph */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
          <Layers className="h-5 w-5 text-slate-400" />
          <span>Training vs. Validation Accuracy History</span>
        </h3>
        <div className="h-[300px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="epoch" label={{ value: 'Epochs', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[0.4, 1.0]} label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${(value * 100).toFixed(0)}%`, 'Accuracy']} />
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="acc" stroke="#0ea5e9" name="Training Accuracy" strokeWidth={2.5} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="val_acc" stroke="#ef4444" name="Validation Accuracy" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ModelPerformance;
