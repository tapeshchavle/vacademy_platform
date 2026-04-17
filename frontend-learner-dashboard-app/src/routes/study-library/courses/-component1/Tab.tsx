// src/routes/study-library/-component/Tab.tsx
import { Link, useRouterState } from '@tanstack/react-router';
import React from 'react';
import { getTerminologyPlural } from '@/components/common/layout-container/sidebar/utils';
import { ContentTerms, SystemTerms } from '@/types/naming-settings';

const getTabs = () => [
  { name: `All ${getTerminologyPlural(ContentTerms.Course, SystemTerms.Course)}`, path: '/study-library/courses' },
  { name: 'In Progress', path: '/study-library/courses' },
  { name: 'Completed', path: '/study-library/courses' },
];

const Tab: React.FC = () => {
  const location = useRouterState({ select: (state) => state.location });
  const tabs = getTabs();

  return (
    <div className="flex items-center p-4 h-14 border-b border-gray-300">
      <ul className="flex space-x-6">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <li key={tab.name}>
              <Link
                to={tab.path}
                className={`pb-2 text-bold text-black hover:text-blue-600 hover:border-b-2 hover:border-blue-600 
                  transition-colors duration-150 ease-in-out focus:outline-none
                  ${isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'border-b-2 border-transparent'}`}
              >
                {tab.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Tab;
