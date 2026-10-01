import type { PhrasingContent, Root } from "mdast";
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import { SKIP, visit } from "unist-util-visit";

export type SeriesLinkResolver = (slug: string, file: VFile) => string | undefined;

export const remarkSeriesLink: Plugin<[{ resolve: SeriesLinkResolver }], Root> = ({ resolve }) => {
  return (tree, file) => {
    visit(tree, "textDirective", (node, index, parent) => {
      if (node.name !== "series-link" || !parent || index === undefined) return;
      const slug = node.attributes?.slug;
      if (!slug) file.fail("series-link needs a slug attribute", node);

      const url = resolve(slug, file);
      const pending = node.attributes?.pending ?? "";
      const replacement: PhrasingContent[] = url
        ? [{ type: "link", url, children: node.children }]
        : [...node.children, ...(pending ? [{ type: "text" as const, value: pending }] : [])];

      parent.children.splice(index, 1, ...replacement);
      return [SKIP, index + replacement.length];
    });
  };
};
