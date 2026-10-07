import { DealRecord } from '../types';

export function exportDealsToCSV(deals: DealRecord[], filename = 'data_engine_pipeline.csv') {
  const headers = [
    'ID',
    'Deal Name',
    'Company',
    'Stage',
    'Value (USD)',
    'ARR (USD)',
    'Probability (%)',
    'Owner',
    'Contact Name',
    'Contact Email',
    'Priority',
    'Health Score',
    'Target Close Date',
    'Created Date',
  ];

  const rows = deals.map((d) => [
    d.id,
    `"${d.name.replace(/"/g, '""')}"`,
    `"${d.company.replace(/"/g, '""')}"`,
    d.stage,
    d.value,
    d.arr,
    d.probability,
    `"${d.owner.replace(/"/g, '""')}"`,
    `"${d.contactName.replace(/"/g, '""')}"`,
    d.contactEmail,
    d.priority,
    d.healthScore,
    d.targetClose,
    d.createdDate,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
