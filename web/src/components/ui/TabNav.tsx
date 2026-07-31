import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function TabNav({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TabNavProps) {
  return (
    <nav
      className={cn(
        "flex border-b border-border overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "text-primary"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      ))}
    </nav>
  );
}
