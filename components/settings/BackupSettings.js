'use client';

import { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, CheckCircle, AlertCircle, X, Database } from 'lucide-react';
import Button from '../ui/Button';
import config from '../../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function BackupSettings({ settings, onSettingChange }) {
  const [isExporting, setIsExporting] = useState(false);
  const [membersData, setMembersData] = useState([]);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Auto hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Fetch members data
  useEffect(() => {
    fetchMembersData();
  }, []);

  const fetchMembersData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${config.api.url}${config.endpoints.member}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setMembersData(data.data.filter(member => member.id_member));
        }
      }
    } catch (error) {
      console.error('Error fetching members data:', error);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
  };

  const loadImageAsBase64 = async (imagePath) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.drawImage(this, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        resolve({
          base64: base64,
          aspectRatio: this.width / this.height
        });
      };
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = imagePath;
    });
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      if (membersData.length === 0) {
        throw new Error('Tidak ada data anggota untuk diexport');
      }

      // Prepare data for Excel
      const excelData = membersData.map((member, index) => ({
        No: index + 1,
        Nama: member.nama || 'N/A',
        NRA: member.nra || 'N/A',
        Email: member.email || 'N/A',
        'Nomor HP': member.nomor_hp || 'N/A',
        Angkatan: member.angkatan || 'N/A',
        Status: member.status_keanggotaan || 'N/A',
        Jurusan: member.jurusan || 'N/A',
        'Tanggal Dikukuhkan': member.tanggal_dikukuhkan || 'N/A',
        Alamat: member.alamat || 'N/A'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // No
        { wch: 25 },  // Nama
        { wch: 15 },  // NRA
        { wch: 30 },  // Email
        { wch: 15 },  // Nomor HP
        { wch: 10 },  // Angkatan
        { wch: 12 },  // Status
        { wch: 20 },  // Jurusan
        { wch: 18 },  // Tanggal Dikukuhkan
        { wch: 30 }   // Alamat
      ];
      ws['!cols'] = colWidths;

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Anggota');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `database-anggota-${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      showNotification('success', 'Database berhasil diexport ke Excel!');
    } catch (error) {
      console.error('Export Excel error:', error);
      showNotification('error', error.message || 'Gagal mengexport data ke Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      if (membersData.length === 0) {
        throw new Error('Tidak ada data anggota untuk diexport');
      }

      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4 for better table fit
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      const marginTop = 20;
      const marginLeft = 15;
      const marginBottom = 20;
      const marginRight = 15;
      
      let currentY = 15;

      // Set font
      doc.setFont('times', 'normal');

      // Load logo
      let logoData = null;
      try {
        logoData = await loadImageAsBase64('/logo-lanscape.png');
      } catch (error) {
        console.log('Could not load logo, using fallback');
      }

      // HEADER SECTION
      const createHeader = () => {
        let logoHeight = 15;  // Changed from const to let
        let logoWidth = logoHeight;
        let logoX = marginLeft;
        let logoY = 15;
        
        if (logoData) {
          logoWidth = logoHeight * logoData.aspectRatio;
          const maxLogoWidth = 25;
          if (logoWidth > maxLogoWidth) {
            logoWidth = maxLogoWidth;
            logoHeight = logoWidth / logoData.aspectRatio;  // This line was causing the error
          }
        }
        
        // Add logo
        if (logoData) {
          doc.addImage(logoData.base64, 'PNG', logoX, logoY, logoWidth, logoHeight);
        } else {
          // Fallback logo
          doc.setDrawColor(41, 121, 255);
          doc.setFillColor(41, 121, 255);
          doc.circle(logoX + logoWidth/2, logoY + logoHeight/2, logoHeight/2, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('times', 'bold');
          doc.text('C', logoX + logoWidth/2, logoY + logoHeight/2 + 2, { align: 'center' });
        }

        // Organization header text - CENTERED layout
        const centerX = pageWidth / 2;
        const textY = logoY + 3;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('DATABASE ANGGOTA COCONUT', centerX, textY, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('times', 'bold');
        doc.text('(COMPUTER CLUB ORIENTED NETWORK, UTILITY AND TECHNOLOGY)', centerX, textY + 6, { align: 'center' });
        
        // Address and contact info
        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.text('Sekretariat: Jl. Monumen Emmy Saelan III No. 70 Karuntung, Kec. Rappocini, Makassar', centerX, textY + 11, { align: 'center' });
        
        // Contact info
        const contactY = textY + 16;
        const contactText = 'Telp. 085240791254/089580126297, Website: ';
        const websiteText = 'www.coconut.or.id';
        const emailText = ' , Email: hello@coconut.or.id';

        const contactWidth = doc.getTextWidth(contactText);
        const websiteWidth = doc.getTextWidth(websiteText);
        const emailWidth = doc.getTextWidth(emailText);
        const totalWidth = contactWidth + websiteWidth + emailWidth;
        
        const startX = centerX - (totalWidth / 2);
        
        doc.setTextColor(0, 0, 0);
        doc.text(contactText, startX, contactY);
        
        doc.setTextColor(0, 0, 255);
        doc.text(websiteText, startX + contactWidth, contactY);
        
        doc.setTextColor(0, 0, 0);
        doc.text(emailText, startX + contactWidth + websiteWidth, contactY);

        // Header separator lines
        const headerEndY = logoY + Math.max(logoHeight, 19) + 4;
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.1);
        doc.line(marginLeft, headerEndY, pageWidth - marginRight, headerEndY);
        
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.line(marginLeft, headerEndY + 0.9, pageWidth - marginRight, headerEndY + 0.9);

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.1);
        doc.line(marginLeft, headerEndY + 1.9, pageWidth - marginRight, headerEndY + 1.9);

        return headerEndY + 8;
      };

      // FOOTER FUNCTION
      const createFooter = () => {
        const footerY = pageHeight - 15;
        doc.setFontSize(6);
        doc.setFont('times', 'normal');
        doc.setTextColor(100, 100, 100);
        
        doc.text('Dibuat oleh Sistem Database Anggota COCONUT Computer Club', marginLeft, footerY);
      };

      // FUNCTION TO ADD PAGE NUMBERS
      const addPageNumbers = () => {
        const totalPages = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          const footerY = pageHeight - 15;
          doc.setFontSize(6);
          doc.setFont('times', 'normal');
          doc.setTextColor(100, 100, 100);
          
          const str = `Halaman ${i} dari ${totalPages}`;
          doc.text(str, pageWidth - marginRight, footerY, { align: 'right' });
        }
      };

      // Create header and get starting position for content
      currentY = createHeader();
      currentY += 5;

      // Title for the report
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('times', 'bold');
      doc.text('DAFTAR ANGGOTA', pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;

      // Current date
      const currentDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      doc.setFontSize(8);
      doc.setFont('times', 'normal');
      doc.text(`Tanggal Cetak: ${currentDate}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 10;

      // Summary
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.text('Ringkasan', marginLeft, currentY);
      currentY += 6;

      const totalAnggota = membersData.length;
      const totalBPH = membersData.filter(m => m.status_keanggotaan === 'bph').length;
      const totalDPO = membersData.filter(m => m.status_keanggotaan === 'dpo').length;
      const totalBP = membersData.filter(m => m.status_keanggotaan === 'bp').length;

      const summaryData = [
        ['Total Anggota', totalAnggota.toString()],
        ['Total BPH', totalBPH.toString()],
        ['Total DPO', totalDPO.toString()],
        ['Total BP', totalBP.toString()]
      ];

      autoTable(doc, {
        startY: currentY,
        head: [['Kategori', 'Jumlah']],
        body: summaryData,
        styles: {
          font: 'times',
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          halign: 'right',
          valign: 'middle',
          fontSize: 8
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 50 },
          1: { halign: 'right', cellWidth: 30 }
        },
        margin: { left: marginLeft, right: marginRight },
        theme: 'grid',
        tableWidth: 'auto'
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // Members table
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.text('Daftar Anggota Detail', marginLeft, currentY);
      currentY += 6;

      const tableData = membersData.map((member, index) => [
        (index + 1).toString(),
        member.nama || 'N/A',
        member.nra || 'N/A',
        member.email || 'N/A',
        member.nomor_hp || 'N/A',
        member.angkatan || 'N/A',
        member.status_keanggotaan || 'N/A',
        member.jurusan || 'N/A'
      ]);

      const tableColumns = ['No', 'Nama', 'NRA', 'Email', 'HP', 'Angkatan', 'Status', 'Jurusan'];

      autoTable(doc, {
        startY: currentY,
        head: [tableColumns],
        body: tableData,
        styles: {
          font: 'times',
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          valign: 'middle',
          fontSize: 7
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 40, halign: 'left' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 50, halign: 'left' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 35, halign: 'left' }
        },
        margin: { left: marginLeft, right: marginRight, bottom: 25 },
        theme: 'grid',
        tableWidth: 'auto',
        didDrawPage: (data) => {
          if (data.pageNumber > 1) {
            createHeader();
          }
          createFooter();
        }
      });

      // Add footer to first page
      createFooter();

      // Add page numbers
      addPageNumbers();

      // Generate filename and save
      const filename = `database-anggota-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      showNotification('success', 'Database berhasil diexport ke PDF!');
    } catch (error) {
      console.error('Export PDF error:', error);
      showNotification('error', error.message || 'Gagal mengexport data ke PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Database</h3>
        <p className="text-sm text-gray-600 mb-6">
          Export seluruh data anggota ke dalam format Excel atau PDF untuk keperluan dokumentasi dan laporan.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleExportExcel}
            disabled={isExporting}
            variant="outline"
            className="flex items-center justify-center space-x-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export ke Excel'}</span>
          </Button>

          <Button 
            onClick={handleExportPdf}
            disabled={isExporting}
            variant="outline"
            className="flex items-center justify-center space-x-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <FileText className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export ke PDF'}</span>
          </Button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Database className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Export Information</h4>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Excel: Format .xlsx dengan semua data dalam spreadsheet yang dapat diedit</li>
                <li>• PDF: Format laporan profesional yang siap cetak dengan logo organisasi</li>
                <li>• File akan otomatis terdownload ke folder Download browser</li>
                <li>• Nama file menggunakan format: database-anggota-YYYY-MM-DD</li>
                <li>• Data real-time diambil langsung dari database saat export</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Export Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <div className={`
            rounded-lg shadow-lg border p-4 transition-all duration-300 transform
            ${notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setNotification({ show: false, type: '', message: '' })}
                  className={`
                    rounded-md inline-flex transition-colors duration-200
                    ${notification.type === 'success' 
                      ? 'text-green-400 hover:text-green-600' 
                      : 'text-red-400 hover:text-red-600'
                    }
                  `}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
