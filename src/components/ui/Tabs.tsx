import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 border-b border-[#E5DFD5] ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              isActive
                ? 'border-[#264235] text-[#264235]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917] hover:border-[#D8D0C3]'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-[#264235]/10 text-[#264235]'
                    : 'bg-[#EFECE6] text-[#78716C]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
