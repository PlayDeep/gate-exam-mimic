
import { CheckCircle, Save, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AutoSaveIndicatorProps {
  status: "saving" | "saved" | "error";
  lastSaved?: Date;
}

const AutoSaveIndicator = ({ status, lastSaved }: AutoSaveIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "saving":
        return {
          icon: Save,
          text: "Saving...",
          variant: "secondary" as const,
          className: "animate-pulse"
        };
      case "saved":
        return {
          icon: CheckCircle,
          text: "Saved",
          variant: "default" as const,
          className: "text-green-600"
        };
      case "error":
        return {
          icon: AlertCircle,
          text: "Save Error",
          variant: "destructive" as const,
          className: "text-red-600"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
      {lastSaved && status === "saved" && (
        <span className="text-xs text-gray-500">
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default AutoSaveIndicator;
