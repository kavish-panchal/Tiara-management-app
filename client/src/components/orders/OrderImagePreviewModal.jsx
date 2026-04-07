import { Printer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const OrderImagePreviewModal = ({ isOpen, onClose, designs, onConfirm }) => {
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
      if (design && canvasRefs.current[skuCode]) {
        drawImageWithText(
          canvasRefs.current[skuCode],
          loadedImages[skuCode],
          design,
        );
      }
    });
  }, [loadedImages]);

  const drawImageWithText = (canvas, image, design) => {
    const ctx = canvas.getContext("2d");

    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image
    ctx.drawImage(image, 0, 0);

    // Prepare text
    const sizeText = design.sizeBreakdown
      .map((sb) => `${sb.size}: ${sb.sets}`)
      .join(" | ");

    // Text styling
    const fontSize = Math.max(image.height * 0.04, 16);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textBaseline = "bottom";

    const padding = 10;

    // Draw text with black outline for better visibility
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.strokeText(sizeText, padding, image.height - padding);

    // Draw white text on top
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(sizeText, padding, image.height - padding);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    // Group designs into pairs (2 per page)
    const designPairs = [];
    for (let i = 0; i < designs.length; i += 2) {
      designPairs.push(designs.slice(i, i + 2));
    }

    const printContent = designPairs
      .map((pair, pageIndex) => {
        const imagesHtml = pair
          .map((design) => {
            const canvas = canvasRefs.current[design.skuCode];
            if (!canvas) return "";

            const imageData = canvas.toDataURL("image/png");
            return `
              <div style="flex: 1; text-align: center; padding: 5px; max-width: 50%;">
                <h3 style="margin-bottom: 5px; font-size: 14px; font-weight: bold;">SKU: ${design.skuCode}</h3>
                <img src="${imageData}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
              </div>
            `;
          })
          .join("");

        const pageBreak =
          pageIndex < designPairs.length - 1 ? "page-break-after: always;" : "";
        return `
          <div style="${pageBreak} display: flex; gap: 10px; padding: 10px; align-items: flex-start; justify-content: center;">
            ${imagesHtml}
          </div>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Order SKU Images</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
            }
            @media print {
              @page {
                size: A4;
                margin: 0.5cm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
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
            Review the images below. Size and set information has been added to
            the bottom-left of each image. You can print these images for your
            workers.
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
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Printer size={20} />
            <span>Print Images</span>
          </button>
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
        </div>
      </div>
    </div>
  );
};

export default OrderImagePreviewModal;
