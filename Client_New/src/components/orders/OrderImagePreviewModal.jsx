import { Printer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OrderImagePreviewModal = ({
  isOpen,
  onClose,
  designs,
  partyName,
  orderNumber,
  onConfirm,
}) => {
  const [loadedImages, setLoadedImages] = useState({});
  const canvasRefs = useRef({});

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (isOpen && designs.length > 0) {
      loadAndProcessImages();
    }
  }, [isOpen, designs]);

  const loadAndProcessImages = async () => {
    const images = {};

    for (const design of designs) {
      if (!design.skuCode) continue;

      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = `${API_BASE_URL}/settings/app/sku-image/${design.skuCode}`;

        await new Promise((resolve, reject) => {
          img.onload = () => {
            images[design.skuCode] = img;
            resolve();
          };
          img.onerror = reject;
        });
      } catch (error) {
        console.error(`Failed to load image for ${design.skuCode}:`, error);
      }
    }

    setLoadedImages(images);
  };

  useEffect(() => {
    // Draw images with text overlay when images are loaded
    Object.keys(loadedImages).forEach((skuCode) => {
      const design = designs.find((d) => d.skuCode === skuCode);
      const designIndex = designs.findIndex((d) => d.skuCode === skuCode);
      if (design && canvasRefs.current[skuCode]) {
        drawImageWithText(
          canvasRefs.current[skuCode],
          loadedImages[skuCode],
          design,
          designIndex + 1, // Design number (1-based)
        );
      }
    });
  }, [loadedImages]);

  const drawImageWithText = (canvas, image, design, designNumber) => {
    const ctx = canvas.getContext("2d");

    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image
    ctx.drawImage(image, 0, 0);

    // Text styling - doubled from original size (16px base -> 32px base, then + 6px = 38px, doubled = 76px)
    const fontSize = (Math.max(image.height * 0.025, 16) + 6) * 2;
    ctx.font = `bold ${fontSize}px Arial`;

    const padding = 15;
    const lineHeight = fontSize * 1.3;

    // Helper function to draw text (black color)
    const drawTextWithOutline = (text, x, y) => {
      // Black text
      ctx.fillStyle = "#000000";
      ctx.fillText(text, x, y);
    };

    // LEFT SIDE - Stacked vertical lines (Design #, Order #, and Date)
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const currentDate = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY format
    const leftLines = [
      `#${designNumber}`,
      ...(orderNumber ? [orderNumber] : []), // Only include if orderNumber exists
      currentDate,
    ];

    const leftStartY = (image.height - leftLines.length * lineHeight) / 2;
    leftLines.forEach((line, index) => {
      drawTextWithOutline(line, padding, leftStartY + index * lineHeight);
    });

    // RIGHT SIDE - Stacked vertical lines (Party Name + Size breakdown)
    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    const rightLines = [
      partyName || "Party Name",
      "", // Empty line for spacing
      ...design.sizeBreakdown.map((sb) => `${sb.size} | ${sb.sets}`),
    ];

    const rightStartY = (image.height - rightLines.length * lineHeight) / 2;
    rightLines.forEach((line, index) => {
      drawTextWithOutline(
        line,
        image.width - padding,
        rightStartY + index * lineHeight,
      );
    });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    // One image per page, formatted for 4x6 inch
    const printContent = designs
      .map((design, index) => {
        const canvas = canvasRefs.current[design.skuCode];
        if (!canvas) return "";

        const imageData = canvas.toDataURL("image/png");
        const pageBreak =
          index < designs.length - 1 ? "page-break-after: always;" : "";

        return `
          <div class="page-container" style="${pageBreak}">
            <img src="${imageData}" class="print-image" />
          </div>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Order SKU Images - 4x6</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            .page-container {
              width: 4in;
              height: 6in;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              page-break-inside: avoid;
              overflow: hidden;
              position: relative;
            }
            .print-image {
              max-width: 100%;
              max-height: 100%;
              width: auto;
              height: auto;
              object-fit: contain;
            }
            @media print {
              @page {
                size: 4in 6in;
                margin: 0;
              }
              html, body {
                width: 4in;
                height: 6in;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .page-container {
                page-break-after: always;
                page-break-inside: avoid;
              }
              .page-container:last-child {
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            Preview SKU Images for Printing
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-slate-400 mb-6">
            Review the images below. Each image includes:
            <br />
            <strong>Left:</strong> Design #{orderNumber ? ", Order #," : ""} and
            Date (vertical) | <strong>Right:</strong> Party Name and Size/Sets
            (vertical)
            <br />
            Text is displayed in black. Images are formatted for 4x6 inch
            printing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {designs.map((design, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  SKU: {design.skuCode}
                </h3>
                <div className="bg-slate-900 rounded-lg p-2">
                  {loadedImages[design.skuCode] ? (
                    <canvas
                      ref={(el) => (canvasRefs.current[design.skuCode] = el)}
                      className="w-full h-auto rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-slate-500">
                      Loading image...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700">
          {orderNumber ? (
            // Print-only mode (for existing orders)
            <>
              <button
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Printer size={20} />
                <span>Print Images</span>
              </button>
            </>
          ) : (
            // Preview mode (for new orders)
            <>
              <button
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Confirm & Create Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderImagePreviewModal;
