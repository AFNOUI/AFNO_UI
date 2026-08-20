/**
 * The shape every builder and variant gallery already produces for its Export
 * tab. Naming it once is what lets `BuilderFilesPanel` be shared: the four
 * builders had four copies of the same tab strip, differing only in the word
 * they used for "generated" and in whether they bothered to show dev
 * dependencies at all.
 */

export interface ExportFile {
    /** Tab label — unique within one panel. */
    name: string;
    /** Destination in the consumer project, shown under the tab. */
    path: string;
    code: string;
    description?: string;
    language?: string;
    /**
     * True for shared engine files — identical in every project, so they are
     * copied (or CLI-installed) once rather than per export.
     */
    isFixed?: boolean;
}

export interface DependencyCommand {
    label: string;
    command: string;
}
