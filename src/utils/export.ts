import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Item, Receipt, Repair, WarrantyStatus } from '@/types';
import { formatDateCN, formatCurrency, getWarrantyStatusText } from './date';

interface ExportItemData {
  item: Item;
  receipts: Receipt[];
  repairs: Repair[];
  totalRepairCost: number;
}

export const exportToPDF = async (
  items: ExportItemData[],
  title: string = '家庭物品资产清单'
): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`导出日期: ${formatDateCN(new Date())}`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 10;

  const drawLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  };

  items.forEach((data, index) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    const warrantyStatus = getWarrantyStatusText(
      getWarrantyStatusFromDate(data.item.warrantyEndDate)
    );

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${data.item.name}`, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const infoLines = [
      `品牌型号: ${data.item.brand} ${data.item.model}`,
      `类别: ${getCategoryLabel(data.item.category)}`,
      `购买日期: ${formatDateCN(data.item.purchaseDate)}`,
      `购买渠道: ${data.item.purchaseChannel}`,
      `购买价格: ${formatCurrency(data.item.price)}`,
      `保修状态: ${warrantyStatus}`,
      `保修截止: ${formatDateCN(data.item.warrantyEndDate)}`,
      `关联票据: ${data.receipts.length} 张`,
      `维修记录: ${data.repairs.length} 次`,
      `累计维修费用: ${formatCurrency(data.totalRepairCost)}`,
    ];

    infoLines.forEach((line) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + 5, yPosition);
      yPosition += 6;
    });

    if (data.receipts.length > 0) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('关联票据:', margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');

      data.receipts.forEach((receipt, rIndex) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(
          `  ${rIndex + 1}. [${getReceiptTypeLabel(receipt.type)}] ${receipt.name} - ${formatDateCN(receipt.issueDate)} - ${formatCurrency(receipt.amount)}`,
          margin + 8,
          yPosition
        );
        yPosition += 5;
      });
    }

    yPosition += 3;
    drawLine();
  });

  const totalAmount = items.reduce((sum, d) => sum + d.item.price, 0);
  const totalRepair = items.reduce((sum, d) => sum + d.totalRepairCost, 0);

  if (yPosition > pageHeight - 30) {
    doc.addPage();
    yPosition = margin;
  }

  drawLine();
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`物品总数: ${items.length} 件`, margin, yPosition);
  yPosition += 7;
  doc.text(`购买总金额: ${formatCurrency(totalAmount)}`, margin, yPosition);
  yPosition += 7;
  doc.text(`累计维修费用: ${formatCurrency(totalRepair)}`, margin, yPosition);
  yPosition += 7;
  doc.text(`资产总值: ${formatCurrency(totalAmount + totalRepair)}`, margin, yPosition);

  doc.save(`家庭物品清单_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportDataAsJSON = (
  items: Item[],
  receipts: Receipt[],
  repairs: Repair[]
): void => {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    items,
    receipts,
    repairs,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `票据数据备份_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importDataFromJSON = (file: File): Promise<{
  items: Item[];
  receipts: Receipt[];
  repairs: Repair[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve({
          items: data.items || [],
          receipts: data.receipts || [],
          repairs: data.repairs || [],
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

function getWarrantyStatusFromDate(date: string): WarrantyStatus {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'expired';
  if (days <= 3) return 'expiring-3';
  if (days <= 7) return 'expiring-7';
  if (days <= 30) return 'expiring-30';
  return 'active';
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    appliance: '家电',
    digital: '数码',
    furniture: '家具',
    car: '汽车',
    other: '其他',
  };
  return labels[category] || category;
}

function getReceiptTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    receipt: '购物小票',
    invoice: '电子发票',
    warranty: '保修卡',
    manual: '说明书',
    contract: '合同',
    certificate: '证书',
    repair: '维修单',
  };
  return labels[type] || type;
}

export async function exportElementToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
