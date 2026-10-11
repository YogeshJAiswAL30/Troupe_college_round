import React from 'react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E5DFD5] bg-white shadow-xs">
      <table className={`w-full text-left border-collapse text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={`bg-[#FAF7F2] border-b border-[#E5DFD5] ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-[#EFECE6] ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={`hover:bg-[#FAF7F2]/60 transition-colors duration-100 ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#605A53] ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-4 py-3.5 text-xs text-[#1C1917] align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};
