import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Import එක වෙනස් කළා

export const generateInvoice = (order) => {
  const doc = new jsPDF();

  // --- Header ---
  doc.setFontSize(20);
  doc.text("INVOICE", 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Invoice ID: ${order._id.slice(-6)}`, 14, 30); // ID shortened
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 35);
  doc.text(`Status: ${order.status}`, 14, 40);
  
  const payStatus = order.paymentStatus === "Paid" ? "PAID" : "PENDING";
  doc.setTextColor(order.paymentStatus === "Paid" ? "green" : "red");
  doc.text(`Payment: ${payStatus}`, 14, 45);
  doc.setTextColor("black");

  // --- Line ---
  doc.line(14, 50, 196, 50);

  // --- Details ---
  doc.setFontSize(12);
  doc.text("From (Supplier):", 14, 60);
  doc.setFontSize(10);
  doc.text(`${order.supplier?.name || "N/A"}`, 14, 66);
  doc.text(`${order.supplier?.email || "N/A"}`, 14, 72);

  doc.setFontSize(12);
  doc.text("Bill To (Customer):", 120, 60);
  doc.setFontSize(10);
  doc.text(`${order.supermarket?.name || "N/A"}`, 120, 66);
  doc.text(`${order.deliveryAddress || "N/A"}`, 120, 72);

  // --- Table ---
  const tableColumn = ["Product", "Qty", "Price (Rs)", "Total (Rs)"];
  const tableRows = [];

  order.items.forEach((item) => {
    const itemData = [
      item.name,
      item.quantity,
      item.price.toLocaleString(),
      (item.quantity * item.price).toLocaleString(),
    ];
    tableRows.push(itemData);
  });

  // ✅ autoTable භාවිතා කරන නිවැරදි ක්‍රමය:
  autoTable(doc, {
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
  });

  // --- Footer ---
  // autoTable එකෙන් පස්සේ Y අගය ගැනීම (lastAutoTable property එකෙන්)
  const finalY = (doc.lastAutoTable?.finalY || 85) + 10;
  
  doc.setFontSize(14);
  doc.text(`Grand Total: Rs. ${order.totalAmount.toLocaleString()}`, 14, finalY);

  if(order.note) {
      doc.setFontSize(10);
      doc.text(`Note: ${order.note}`, 14, finalY + 10);
  }

  doc.save(`Invoice_${order._id.slice(-6)}.pdf`);
};