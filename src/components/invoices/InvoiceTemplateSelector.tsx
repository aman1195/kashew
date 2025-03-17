import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface InvoiceTemplateSelectorProps {
  selectedTemplate: number;
  onSelectTemplate: (templateId: number) => void;
  className?: string;
}

const InvoiceTemplateSelector = ({
  selectedTemplate = 1,
  onSelectTemplate,
  className = "",
}: InvoiceTemplateSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const templates = [
    {
      id: 1,
      name: "Modern",
      color: "bg-vibrant-yellow",
      textColor: "text-black",
      layout: "modern",
    },
    {
      id: 2,
      name: "Professional",
      color: "bg-vibrant-green",
      textColor: "text-white",
      layout: "professional",
    },
    {
      id: 3,
      name: "Minimal",
      color: "bg-vibrant-black",
      textColor: "text-white",
      layout: "minimal",
    },
    {
      id: 4,
      name: "Creative",
      color: "bg-vibrant-pink",
      textColor: "text-black",
      layout: "creative",
    },
    {
      id: 5,
      name: "Classic",
      color: "bg-white border border-gray-200",
      textColor: "text-black",
      layout: "classic",
    },
  ];

  return (
    <div className={cn("relative h-32", className)}>
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {templates.map((template, index) => {
          // Calculate rotation for fan effect
          const rotation = isExpanded
            ? (index - 2) * 10 // When expanded, spread out in a fan
            : (index - selectedTemplate + 1) * 2; // When collapsed, stack with slight offset

          // Calculate z-index to ensure proper stacking
          const zIndex = isExpanded
            ? 5 // All cards have same z-index when expanded
            : template.id === selectedTemplate
              ? 5
              : 5 - Math.abs(template.id - selectedTemplate);

          // Calculate scale for the selected template
          const scale = template.id === selectedTemplate ? 1 : 0.95;

          // Calculate vertical offset
          const y = isExpanded
            ? -20 // Lift all cards when expanded
            : template.id === selectedTemplate
              ? -20
              : 0; // Only lift selected card when collapsed

          return (
            <motion.div
              key={template.id}
              className={cn(
                "absolute origin-bottom cursor-pointer transition-shadow",
                template.id === selectedTemplate && !isExpanded
                  ? "shadow-lg"
                  : "",
              )}
              style={{ zIndex }}
              initial={false}
              animate={{
                rotateZ: rotation,
                scale: scale,
                y: y,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                if (isExpanded) {
                  onSelectTemplate(template.id);
                  setIsExpanded(false);
                } else {
                  setIsExpanded(true);
                }
              }}
            >
              <Card
                className={cn(
                  "w-60 h-28 overflow-hidden transition-all",
                  template.id === selectedTemplate ? "ring-2 ring-primary" : "",
                )}
              >
                <CardContent className={`p-0 h-full ${template.color}`}>
                  <div className="p-4 flex flex-col justify-between h-full">
                    <div className={cn("font-medium", template.textColor)}>
                      {template.name}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div
                        className={cn(
                          "h-2 w-16 rounded-sm bg-current opacity-20",
                          template.textColor,
                        )}
                      ></div>
                      <div
                        className={cn(
                          "h-2 w-12 rounded-sm bg-current opacity-20",
                          template.textColor,
                        )}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InvoiceTemplateSelector;
