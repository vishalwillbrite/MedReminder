import API from '../services/api';

export const downloadMedicinesCSV = async () => {
  const response = await API.get('/export/csv', {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `MedReminder_Prescriptions_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const printMedicationSchedulePDF = (medicines = []) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rowsHtml = medicines
    .map(
      (m) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${m.name}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.dosage} (${m.medicineType})</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.foodTiming}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${(m.reminderTimes || []).join(', ')}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">Dr. ${m.doctorName || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.status}</td>
    </tr>
  `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MedReminder - Prescription Schedule</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 24px; color: #0f172a; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #00a5e5; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 800; color: #00a5e5; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">MedReminder Prescription Schedule</div>
          <div>Printed: ${new Date().toLocaleDateString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Dosage & Form</th>
              <th>Food Intake</th>
              <th>Daily Alarm Times</th>
              <th>Doctor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
