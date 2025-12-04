import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Payment, formatCurrency, getPaymentMethodLabel, getAppointmentById } from "./payment";

/**
 * Generate PDF invoice from payment data
 */
export const generateInvoicePDF = async (payment: Payment): Promise<void> => {
  try {
    // Get appointment info
    const appointment = getAppointmentById(payment.appointmentId);

    // Create a temporary container for the invoice
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "210mm"; // A4 width
    container.style.padding = "20mm";
    container.style.backgroundColor = "#ffffff";
    container.style.fontFamily = "Arial, sans-serif";
    document.body.appendChild(container);

    // Build invoice HTML
    const invoiceHTML = `
      <div style="max-width: 100%; color: #000;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #007BFF; padding-bottom: 20px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
              <h1 style="font-size: 28px; font-weight: bold; color: #007BFF; margin: 0;">ClinicCare</h1>
            </div>
            <p style="font-size: 12px; color: #666; margin: 4px 0;">123 Đường ABC, Quận 1, TP.HCM</p>
            <p style="font-size: 12px; color: #666; margin: 4px 0;">Điện thoại: 1900 xxxx</p>
            <p style="font-size: 12px; color: #666; margin: 4px 0;">Email: contact@cliniccare.vn</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 11px; color: #666; margin-bottom: 4px;">Mã hóa đơn</p>
            <p style="font-size: 18px; font-weight: bold; color: #000; margin: 0;">${payment.id}</p>
            ${payment.transactionId ? `
              <p style="font-size: 11px; color: #666; margin-top: 12px; margin-bottom: 4px;">Mã giao dịch</p>
              <p style="font-size: 12px; font-family: monospace; color: #000; margin: 0;">${payment.transactionId}</p>
            ` : ""}
          </div>
        </div>

        <!-- Customer and Service Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div>
            <p style="font-size: 13px; font-weight: bold; color: #333; margin-bottom: 8px;">Thông tin khách hàng</p>
            ${appointment ? `
              <p style="font-size: 12px; color: #666; margin: 4px 0;">${appointment.patientName || "N/A"}</p>
              ${appointment.patientPhone ? `<p style="font-size: 12px; color: #666; margin: 4px 0;">${appointment.patientPhone}</p>` : ""}
              ${appointment.patientEmail ? `<p style="font-size: 12px; color: #666; margin: 4px 0;">${appointment.patientEmail}</p>` : ""}
            ` : "<p style='font-size: 12px; color: #666;'>Không có thông tin</p>"}
          </div>
          <div>
            <p style="font-size: 13px; font-weight: bold; color: #333; margin-bottom: 8px;">Thông tin dịch vụ</p>
            ${appointment ? `
              <p style="font-size: 12px; color: #666; margin: 4px 0;">Bác sĩ: ${appointment.doctorName || "N/A"}</p>
              <p style="font-size: 12px; color: #666; margin: 4px 0;">Chuyên khoa: ${appointment.specialty || "N/A"}</p>
              <p style="font-size: 12px; color: #666; margin: 4px 0;">
                ${new Date(appointment.date).toLocaleDateString("vi-VN")} lúc ${appointment.time || "N/A"}
              </p>
            ` : "<p style='font-size: 12px; color: #666;'>Không có thông tin</p>"}
          </div>
        </div>

        <!-- Payment Details -->
        <div style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
            <span style="font-size: 12px; color: #666;">Dịch vụ khám bệnh</span>
            <span style="font-size: 12px; font-weight: 600; color: #000;">${formatCurrency(payment.amount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
            <span style="font-size: 12px; color: #666;">Phương thức thanh toán</span>
            <span style="font-size: 12px; font-weight: 600; color: #000;">${getPaymentMethodLabel(payment.method)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #007BFF; border-bottom: 2px solid #007BFF; margin-top: 8px;">
            <span style="font-size: 16px; font-weight: bold; color: #000;">Tổng cộng</span>
            <span style="font-size: 20px; font-weight: bold; color: #007BFF;">${formatCurrency(payment.amount)}</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="font-size: 11px; color: #666; margin: 4px 0;">
            Ngày thanh toán: ${new Date(payment.completedAt || payment.createdAt).toLocaleString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p style="font-size: 11px; color: #666; margin: 8px 0;">
            Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!
          </p>
          <p style="font-size: 10px; color: #999; margin: 4px 0;">
            Hóa đơn điện tử có giá trị pháp lý theo quy định của pháp luật
          </p>
        </div>
      </div>
    `;

    container.innerHTML = invoiceHTML;

    // Wait for fonts and images to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    const fileName = `HoaDon_${payment.id}_${new Date().toISOString().split("T")[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Không thể tạo file PDF. Vui lòng thử lại.");
  }
};

/**
 * Generate PDF invoice from HTML element (alternative method)
 */
export const generateInvoicePDFFromElement = async (
  element: HTMLElement,
  fileName: string = "invoice.pdf"
): Promise<void> => {
  try {
    // Convert element to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Không thể tạo file PDF. Vui lòng thử lại.");
  }
};

