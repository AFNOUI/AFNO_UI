import type { BuilderNode } from "@/ui-builder/data/uiBuilderRegistry";
import type { ImportTracker } from "./imports";
import { getChartRenderer, renderChart } from "./chartRenderers";
import {
    renderAccordionContainer,
    renderAlert,
    renderAvatar,
    renderBadge,
    renderButton,
    renderCard,
    renderCodeBlock,
    renderContainerLike,
    renderDataTable,
    renderDivider,
    renderFallback,
    renderFaq,
    renderFeatureGrid,
    renderFooter,
    renderHeading,
    renderImage,
    renderLink,
    renderList,
    renderMetricWidget,
    renderNewsletter,
    renderPricing,
    renderProgress,
    renderSpacer,
    renderStatCard,
    renderStatsCounter,
    renderTabsContainer,
    renderTestimonial,
    renderText,
    renderVideo,
} from "./nodeRenderers";
import {
    renderCheckbox,
    renderDatePicker,
    renderFileUpload,
    renderInput,
    renderRadioGroup,
    renderSelect,
    renderSwitchControl,
    renderTextarea,
} from "./formRenderers";

/**
 * Central dispatcher replicating the legacy `nodeToJSX` switch. Keeping every
 * branch in one place makes it easy to audit what node types the code gen
 * currently understands, while the heavy lifting lives in per-family modules.
 */
export function nodeToJSX(node: BuilderNode, imports: ImportTracker, indent = 2): string {
    switch (node.type) {
        case "container":
        case "section":
        case "flex":
        case "columns":
        case "grid":
            return renderContainerLike(node, imports, indent, nodeToJSX);
        case "card":
            return renderCard(node, imports, indent, nodeToJSX);
        case "heading":
            return renderHeading(node, indent);
        case "text":
            return renderText(node, indent);
        case "image":
            return renderImage(node, indent);
        case "button":
            return renderButton(node, imports, indent);
        case "divider":
            return renderDivider(node, imports, indent);
        case "spacer":
            return renderSpacer(node, indent);
        case "badge":
            return renderBadge(node, imports, indent);
        case "link":
            return renderLink(node, indent);
        case "list":
            return renderList(node, indent);
        case "avatar":
            return renderAvatar(node, imports, indent);
        case "alert":
            return renderAlert(node, imports, indent);
        case "code-block":
            return renderCodeBlock(node, indent);
        case "progress":
            return renderProgress(node, imports, indent);
        case "video":
            return renderVideo(node, indent);
        case "tabs-container":
            return renderTabsContainer(node, imports, indent);
        case "accordion-container":
            return renderAccordionContainer(node, imports, indent);
        case "testimonial":
            return renderTestimonial(node, indent);
        case "pricing":
            return renderPricing(node, imports, indent);
        case "feature-grid":
            return renderFeatureGrid(node, indent);
        case "stats-counter":
            return renderStatsCounter(node, indent);
        case "faq":
            return renderFaq(node, imports, indent);
        case "newsletter":
            return renderNewsletter(node, imports, indent);
        case "footer":
            return renderFooter(node, imports, indent);
        case "input":
            return renderInput(node, imports, indent);
        case "textarea":
            return renderTextarea(node, imports, indent);
        case "select":
            return renderSelect(node, imports, indent);
        case "checkbox":
            return renderCheckbox(node, imports, indent);
        case "switch":
            return renderSwitchControl(node, imports, indent);
        case "radio-group":
            return renderRadioGroup(node, imports, indent);
        case "date-picker":
            return renderDatePicker(node, imports, indent);
        case "file-upload":
            return renderFileUpload(node, imports, indent);
        case "stat-card":
            return renderStatCard(node, indent);
        case "data-table":
            return renderDataTable(node, imports, indent);
        case "metric-widget":
            return renderMetricWidget(node, indent);
        case "hero":
        case "cta":
            return renderContainerLike(node, imports, indent, nodeToJSX);
        default: {
            const chart = getChartRenderer(node.type);
            if (chart) return renderChart(node, imports, indent, chart);
            return renderFallback(node, indent);
        }
    }
}
