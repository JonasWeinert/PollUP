import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { ElementCard } from "./ElementCard";
import { ConditionalLogicModal } from "./ConditionalLogicModal";
import { EditElementModal } from "./EditElementModal";
import { toast } from "sonner";

interface SortableElementListProps {
  elements: (Doc<"elements"> & { imageUrl?: string | null; choices?: any[] })[];
  sessionId: Id<"sessions">;
}

export function SortableElementList({ elements, sessionId }: SortableElementListProps) {
  const [selectedElementForConditional, setSelectedElementForConditional] = useState<Doc<"elements"> | null>(null);
  const [selectedElementForEdit, setSelectedElementForEdit] = useState<(Doc<"elements"> & { imageUrl?: string | null; choices?: any[] }) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moveElementUp = useMutation(api.elements.moveElementUp);
  const moveElementDown = useMutation(api.elements.moveElementDown);
  const importElements = useMutation(api.elements.importElements);

  const handleMoveUp = async (elementId: Id<"elements">) => {
    try {
      const moved = await moveElementUp({ elementId });
      if (moved) {
        toast.success("Element moved up");
      } else {
        toast.info("Element is already at the top");
      }
    } catch (error) {
      toast.error("Failed to move element");
    }
  };

  const handleMoveDown = async (elementId: Id<"elements">) => {
    try {
      const moved = await moveElementDown({ elementId });
      if (moved) {
        toast.success("Element moved down");
      } else {
        toast.info("Element is already at the bottom");
      }
    } catch (error) {
      toast.error("Failed to move element");
    }
  };

  const handleExport = () => {
    // Prepare elements for export (remove internal fields and imageUrls)
    const exportData = elements.map(element => ({
      type: element.type,
      title: element.title,
      subtitle: element.subtitle,
      description: element.description,
      choices: element.choices?.map(choice => ({
        id: choice.id,
        text: choice.text,
        isCorrect: choice.isCorrect,
      })),
      minValue: element.minValue,
      maxValue: element.maxValue,
      step: element.step,
    }));

    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elements-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Elements exported successfully");
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedElements = JSON.parse(text);

      // Validate the imported data
      if (!Array.isArray(importedElements)) {
        throw new Error("Invalid format: expected an array of elements");
      }

      // Import elements
      await importElements({ sessionId, elements: importedElements });
      toast.success(`Successfully imported ${importedElements.length} elements`);
    } catch (error: any) {
      toast.error(`Failed to import elements: ${error.message || 'Invalid file format'}`);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      {/* Import/Export buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={handleExport}
          disabled={elements.length === 0}
          className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Elements
        </button>
        <button
          onClick={handleImport}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Elements
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="space-y-4">
        {elements.map((element, index) => (
          <div key={element._id} className="flex items-start gap-2">
            {/* Move buttons - hidden on very small screens, shown as compact buttons */}
            <div className="hidden sm:flex flex-col gap-1 pt-2">
              <button
                onClick={() => handleMoveUp(element._id)}
                disabled={index === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-gray-200"
                title="Move up"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => handleMoveDown(element._id)}
                disabled={index === elements.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-gray-200"
                title="Move down"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Element card */}
            <div className="flex-1 min-w-0">
              <ElementCard element={element} onEdit={() => setSelectedElementForEdit(element)} />
              
              {/* Conditional logic indicator and mobile move buttons */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {element.conditionalLogic?.enabled && (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
                      Conditional
                    </span>
                  )}
                  
                  {/* Mobile move buttons */}
                  <div className="flex sm:hidden items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(element._id)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-gray-200"
                      title="Move up"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveDown(element._id)}
                      disabled={index === elements.length - 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-gray-200"
                      title="Move down"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedElementForConditional(element)}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Configure Logic</span>
                  <span className="sm:hidden">Logic</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedElementForConditional && (
        <ConditionalLogicModal
          element={selectedElementForConditional}
          availableElements={elements.filter((e: Doc<"elements">) => 
            e.order < selectedElementForConditional.order && e._id !== selectedElementForConditional._id
          )}
          onClose={() => setSelectedElementForConditional(null)}
        />
      )}

      {selectedElementForEdit && (
        <EditElementModal
          element={selectedElementForEdit}
          onClose={() => setSelectedElementForEdit(null)}
        />
      )}
    </>
  );
}
