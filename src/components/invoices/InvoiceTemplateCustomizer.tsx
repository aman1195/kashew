import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Palette, Type, Layout, Image } from "lucide-react";

interface InvoiceTemplateCustomizerProps {
  templateId: number;
  onTemplateChange: (id: number) => void;
  onCustomizationChange: (customization: any) => void;
  customization: any;
}

const InvoiceTemplateCustomizer = ({
  templateId,
  onTemplateChange,
  onCustomizationChange,
  customization,
}: InvoiceTemplateCustomizerProps) => {
  const [activeTab, setActiveTab] = useState("templates");

  const templates = [
    { id: 1, name: "Modern", color: "bg-vibrant-yellow" },
    { id: 2, name: "Professional", color: "bg-vibrant-green" },
    { id: 3, name: "Minimal", color: "bg-vibrant-black" },
    { id: 4, name: "Creative", color: "bg-vibrant-pink" },
    { id: 5, name: "Classic", color: "bg-white border border-gray-200" },
  ];

  const handleColorChange = (colorType: string, color: string) => {
    onCustomizationChange({
      ...customization,
      colors: {
        ...customization.colors,
        [colorType]: color,
      },
    });
  };

  const handleLogoToggle = (enabled: boolean) => {
    onCustomizationChange({
      ...customization,
      logo: {
        ...customization.logo,
        enabled,
      },
    });
  };

  const handleLogoUrlChange = (url: string) => {
    onCustomizationChange({
      ...customization,
      logo: {
        ...customization.logo,
        url,
      },
    });
  };

  const handleFontChange = (font: string) => {
    onCustomizationChange({
      ...customization,
      typography: {
        ...customization.typography,
        font,
      },
    });
  };

  const handleFontSizeChange = (value: number[]) => {
    onCustomizationChange({
      ...customization,
      typography: {
        ...customization.typography,
        size: value[0],
      },
    });
  };

  return (
    <Card className="modern-card overflow-hidden">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none grid grid-cols-4">
            <TabsTrigger value="templates" className="rounded-none">
              <Layout className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="colors" className="rounded-none">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="rounded-none">
              <Type className="h-4 w-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="logo" className="rounded-none">
              <Image className="h-4 w-4 mr-2" />
              Logo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="p-4">
            <div className="grid grid-cols-5 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`cursor-pointer transition-all h-24 rounded-lg overflow-hidden ${template.color} ${templateId === template.id ? "ring-2 ring-primary" : "hover:scale-105"}`}
                  onClick={() => onTemplateChange(template.id)}
                >
                  <div className="p-2 text-xs font-medium">{template.name}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="colors" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <ColorPicker
                color={customization.colors.primary}
                onChange={(color) => handleColorChange("primary", color)}
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <ColorPicker
                color={customization.colors.secondary}
                onChange={(color) => handleColorChange("secondary", color)}
              />
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <ColorPicker
                color={customization.colors.text}
                onChange={(color) => handleColorChange("text", color)}
              />
            </div>
          </TabsContent>

          <TabsContent value="typography" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <select
                className="w-full p-2 rounded-md border border-input bg-background"
                value={customization.typography.font}
                onChange={(e) => handleFontChange(e.target.value)}
              >
                <option value="inter">Inter</option>
                <option value="roboto">Roboto</option>
                <option value="poppins">Poppins</option>
                <option value="montserrat">Montserrat</option>
                <option value="opensans">Open Sans</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm">
                  {customization.typography.size}px
                </span>
              </div>
              <Slider
                defaultValue={[customization.typography.size]}
                max={20}
                min={10}
                step={1}
                onValueChange={handleFontSizeChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="logo" className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="logo-toggle"
                checked={customization.logo.enabled}
                onCheckedChange={handleLogoToggle}
              />
              <Label htmlFor="logo-toggle">Show Logo</Label>
            </div>

            {customization.logo.enabled && (
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  placeholder="Enter logo URL"
                  value={customization.logo.url}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                />
                {customization.logo.url && (
                  <div className="mt-4 p-4 border rounded-md flex justify-center">
                    <img
                      src={customization.logo.url}
                      alt="Logo Preview"
                      className="max-h-16 object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InvoiceTemplateCustomizer;
