import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  FolderOpen,
  Download,
  Eye,
  Search,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const materials = [
  {
    id: "1",
    title: "Week 1: Introduction Slides",
    type: "slides",
    format: "PDF",
    size: "2.4 MB",
    uploaded: "Jan 13, 2026",
    module: "Week 1",
  },
  {
    id: "2",
    title: "Week 1: Lecture Recording",
    type: "video",
    format: "MP4",
    size: "156 MB",
    uploaded: "Jan 14, 2026",
    module: "Week 1",
  },
  {
    id: "3",
    title: "Week 1: Reading - Computational Thinking",
    type: "reading",
    format: "PDF",
    size: "1.1 MB",
    uploaded: "Jan 14, 2026",
    module: "Week 1",
  },
  {
    id: "4",
    title: "Week 2: Variables & Data Types Slides",
    type: "slides",
    format: "PDF",
    size: "3.2 MB",
    uploaded: "Jan 20, 2026",
    module: "Week 2",
  },
  {
    id: "5",
    title: "Week 2: Code Examples",
    type: "code",
    format: "ZIP",
    size: "856 KB",
    uploaded: "Jan 21, 2026",
    module: "Week 2",
  },
  {
    id: "6",
    title: "Week 3: Control Flow Lecture Notes",
    type: "notes",
    format: "PDF",
    size: "1.8 MB",
    uploaded: "Jan 27, 2026",
    module: "Week 3",
  },
  {
    id: "7",
    title: "Week 4: Functions - Practice Problems",
    type: "exercise",
    format: "PDF",
    size: "512 KB",
    uploaded: "Feb 3, 2026",
    module: "Week 4",
  },
  {
    id: "8",
    title: "Week 5: Arrays & Lists - Supplementary Reading",
    type: "reading",
    format: "PDF",
    size: "2.0 MB",
    uploaded: "Feb 10, 2026",
    module: "Week 5",
  },
  {
    id: "9",
    title: "Week 6: Searching & Sorting - Algorithm Visualizations",
    type: "slides",
    format: "PDF",
    size: "4.1 MB",
    uploaded: "Feb 17, 2026",
    module: "Week 6",
  },
];

const typeMeta: Record<
  string,
  { label: string; className: string }
> = {
  slides: {
    label: "Slides",
    className: "bg-blue-100 text-blue-700",
  },
  video: {
    label: "Video",
    className: "bg-purple-100 text-purple-700",
  },
  reading: {
    label: "Reading",
    className: "bg-green-100 text-green-700",
  },
  code: {
    label: "Code",
    className: "bg-amber-100 text-amber-700",
  },
  notes: {
    label: "Notes",
    className: "bg-rose-100 text-rose-700",
  },
  exercise: {
    label: "Exercise",
    className: "bg-teal-100 text-teal-700",
  },
};

export default function CourseMaterials() {
  const { courseId } = useParams();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = materials.filter((m) => {
    const matchesSearch = m.title
      .toLowerCase()
      .includes(search.toLowerCase());
    if (typeFilter === "all") return matchesSearch;
    return matchesSearch && m.type === typeFilter;
  });

  const types = ["all", ...new Set(materials.map((m) => m.type))];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/student/courses/1">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Course
            </Link>
          </Button>
          <PageHeader
            title="Course Materials"
            description="CS101: Introduction to Computer Science"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(t)}
              >
                {t === "all" ? "All" : typeMeta[t]?.label || t}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((material) => (
            <Card
              key={material.id}
              className="flex items-center gap-4 p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-primary truncate">
                  {material.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <Badge
                    className={typeMeta[material.type]?.className}
                    variant="secondary"
                  >
                    {typeMeta[material.type]?.label}
                  </Badge>
                  <span>{material.format}</span>
                  <span>{material.size}</span>
                  <span>{material.uploaded}</span>
                  <span>{material.module}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/student/courses/${courseId}/materials/${material.id}`}>
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
