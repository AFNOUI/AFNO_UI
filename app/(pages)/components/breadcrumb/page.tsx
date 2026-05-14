import { BreadcrumbBasic } from "@/components/lab/breadcrumb/BreadcrumbBasic";
import { BreadcrumbFilePath } from "@/components/lab/breadcrumb/BreadcrumbFilePath";
import { BreadcrumbWithIcons } from "@/components/lab/breadcrumb/BreadcrumbWithIcons";
import { BreadcrumbWithEllipsis } from "@/components/lab/breadcrumb/BreadcrumbWithEllipsis";
import { BreadcrumbCustomSeparator } from "@/components/lab/breadcrumb/BreadcrumbCustomSeparator";

export default function BreadcrumbPageLayout() {
  return (
    <div className="space-y-6">
      <BreadcrumbBasic />
      <BreadcrumbWithIcons />
      <BreadcrumbWithEllipsis />
      <BreadcrumbCustomSeparator />
      <BreadcrumbFilePath />
    </div>
  );
}
