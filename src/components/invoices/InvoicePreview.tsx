import React from 'react';

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  price: number;
}

interface TaxInfo {
  rate: number;
  type: 'vat' | 'gst' | 'sales_tax';
  amount: number;
}

interface InvoicePreviewProps {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  billTo: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  billFrom: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  tax?: TaxInfo;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoiceNumber,
  issueDate,
  dueDate,
  billTo,
  billFrom,
  items,
  notes = 'Thank you for your business!',
  terms = 'Payment due within 30 days',
  tax = { rate: 0, type: 'vat', amount: 0 },
}) => {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const total = subtotal + (tax?.amount || 0);

  return (
    <div className="max-w-4xl mx-auto p-5 bg-white shadow-lg text-black my-10">
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <div className="mt-1">
              <span className="font-bold">Invoice Number: </span>
              <span>{invoiceNumber}</span>
            </div>
          </div>
          <div className="text-right">
            <div>
              <span className="font-bold">Issue Date: </span>
              <span>{issueDate}</span>
            </div>
            <div className="mt-1">
              <span className="font-bold">Due Date: </span>
              <span>{dueDate}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div className="w-1/2 pr-4">
            <h2 className="text-lg font-bold mb-2">Bill From:</h2>
            <div className="mb-1">
              {billFrom.name}
            </div>
            <div className="mb-1">
              {billFrom.address}
            </div>
            <div className="mb-1">
              {billFrom.email}
            </div>
            <div className="mb-1">
              {billFrom.phone}
            </div>
          </div>

          <div className="w-1/2 pl-4">
            <h2 className="text-lg font-bold mb-2">Bill To:</h2>
            <div className="mb-1">
              {billTo.name}
            </div>
            <div className="mb-1">
              {billTo.address}
            </div>
            <div className="mb-1">
              {billTo.email}
            </div>
            <div className="mb-1">
              {billTo.phone}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Invoice Items:</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Qty</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index} className="border-b border-gray-200">
                  <td className="py-2">
                    {item.description}
                  </td>
                  <td className="py-2 text-right">
                    {item.quantity}
                  </td>
                  <td className="py-2 text-right">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="py-2 text-right">
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-1/3">
            <div className="flex justify-between mb-1">
              <span className="font-bold">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {tax.rate > 0 && (
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <span className="font-bold">Tax ({tax.type.toUpperCase()} {tax.rate}%):</span>
                </div>
                <span>${tax.amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-1">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Notes:</h2>
          <div className="border border-gray-300 p-2">
            {notes}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Terms and Conditions:</h2>
          <div className="border border-gray-300 p-2">
            {terms}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
