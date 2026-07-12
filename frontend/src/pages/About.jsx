import React from 'react';
import { HelpCircle, ShieldAlert, Sparkles, Cpu, HardDrive } from 'lucide-react';

const About = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">System Information & AI Model Specifications</h1>
        <p className="text-sm text-slate-500 font-medium">Overview of the neural classifier, preprocessing configurations, and diagnostic safety boundaries</p>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left/Middle: Model explanation */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Neural network specs */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-clinical-600" />
              <span>ResNet50 Neural Classifier</span>
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              MastishkNetra employs a 50-layer deep Convolutional Neural Network (CNN) architecture with Residual connections (ResNet50). 
              Rather than training the network from scratch, the system incorporates <strong>Transfer Learning</strong>. The convolutional base layers 
              are pre-trained on the ImageNet image corpus, enabling highly generalized spatial feature extraction (edges, contours, density variations).
            </p>
            
            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
              The neural pipeline consists of:
            </p>
            
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
              <li><strong>Zero-Centering Preprocessing:</strong> Subtracts the ImageNet BGR channel mean values ([103.939, 116.779, 123.68]) to prepare input tensors.</li>
              <li><strong>Global Average Pooling:</strong> Reduces the 7x7 spatial feature grids into a flat 2048-element representation vector.</li>
              <li><strong>Regularized Dense Head:</strong> Incorporates a 512-neuron fully connected layer with ReLU activation, followed by a 40% dropout rate to mitigate model overfitting.</li>
              <li><strong>Softmax Activation:</strong> Calculates absolute class-wise probability distributions across Glioma, Meningioma, Pituitary, and No Tumor labels.</li>
            </ul>
          </div>

          {/* Card: System design parameters */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-clinical-600" />
              <span>Database Integrity Patterns</span>
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              To adhere to strict healthcare compliance, all diagnostic records processed by the system are handled via an 
              <strong>Append-Only Revision History</strong> schema in MongoDB. Overwriting original diagnostic model outcomes is strictly prohibited. 
              Subsequent updates made by clinicians (notes, review states) append new version states into a historical revisions array, preserving 
              a complete audit trail.
            </p>
          </div>

        </div>

        {/* Right: Legal & Safety Warnings */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-amber-800 flex items-center space-x-2 border-b border-amber-200 pb-3">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <span>Clinical Notice & Disclaimer</span>
          </h3>
          
          <div className="text-xs font-medium text-amber-700 space-y-4 leading-relaxed">
            <p className="font-bold text-amber-800">
              IMPORTANT SAFETY WARNING:
            </p>
            <p>
              MastishkNetra is a secondary decision support system designed to assist medical practitioners. It is not intended to serve as a standalone diagnostic system or substitute for professional medical advice, radiologic assessments, or pathology consultations.
            </p>
            <p>
              The deep learning model calculates statistical associations based on patterns found in MRI training data. Model metrics (92% accuracy) do not guarantee accuracy for any individual clinical scan slice.
            </p>
            <p>
              Final diagnosis and treatment plans must always be determined by qualified clinical personnel based on complete medical history, lab diagnostics, and comprehensive imaging.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
