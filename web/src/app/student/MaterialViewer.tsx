import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  FileText,
  ChevronRight,
  ChevronLeft as ArrowLeft,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const materialData = {
  id: "1",
  title: "Week 1: Introduction Slides",
  type: "slides",
  format: "PDF",
  pages: 24,
  currentPage: 1,
};

export default function MaterialViewer() {
  const { courseId, materialId } = useParams();
  const [zoom, setZoom] = useState(100);

  return (
    <StudentLayout>
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-1">
              <Link to={`/student/courses/${courseId}/materials`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Materials
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-text-primary">
              {materialData.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-[3rem] text-center text-sm text-text-secondary">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="flex flex-1 items-center justify-center bg-neutral-50 p-8">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-text-muted" />
            <p className="mt-4 text-text-secondary">
              PDF preview would render here
            </p>
            <p className="text-sm text-text-muted">
              {materialData.title} &middot; {materialData.format} &middot;{" "}
              {materialData.pages} pages
            </p>
          </div>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {materialData.currentPage} of {materialData.pages}
          </span>
          <Button variant="outline" size="sm">
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StudentLayout>
  );
}
