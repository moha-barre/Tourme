import React from 'react';

interface StepProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const Step: React.FC<StepProps> = ({ icon, title, text }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-200">
      <div className="mb-4 text-blue-600">{icon}</div>
      <h4 className="text-md font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
};

export default Step;
