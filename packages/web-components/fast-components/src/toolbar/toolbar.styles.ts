import { css, ElementStyles } from "@microsoft/fast-element";
import {
    display,
    focusVisible,
    forcedColorsStylesheetBehavior,
} from "@microsoft/fast-foundation";
import { SystemColors } from "@microsoft/fast-web-utilities";
import {
    neutralFillCardRestBehavior,
    neutralFocusBehavior,
    neutralOutlineFocusBehavior,
} from "../styles/recipes";

/**
 * Styles for the {@link (FASTToolbar:class)|FASTToolbar component}.
 *
 * @public
 */
export const ToolbarStyles: ElementStyles = css`
    ${display("inline-flex")} :host {
        --toolbar-item-gap: calc((var(--design-unit) + calc(var(--density) + 2)) * 1px);
        background-color: ${neutralFillCardRestBehavior.var};
        border-radius: calc(var(--corner-radius) * 1px);
        fill: currentcolor;
        padding: var(--toolbar-item-gap);
    }

    :host(${focusVisible}) {
        outline: calc(var(--outline-width) * 1px) solid ${neutralOutlineFocusBehavior.var};
    }

    .positioning-region {
        align-items: flex-start;
        display: inline-flex;
        flex-flow: row wrap;
        justify-content: flex-start;
    }

    :host([orientation="vertical"]) .positioning-region {
        flex-direction: column;
    }

    ::slotted(:not([slot])) {
        flex: 0 0 auto;
        margin: 0 var(--toolbar-item-gap);
    }

    :host([orientation="vertical"]) ::slotted(:not([slot])) {
        margin: var(--toolbar-item-gap) 0;
    }

    .start,
    .end {
        display: flex;
        margin: auto;
        margin-inline: 0;
    }

    ::slotted(svg) {
        ${/* Glyph size is temporary - replace when adaptive typography is figured out */ ""}
        width: 16px;
        height: 16px;
    }
`.withBehaviors(
    neutralFillCardRestBehavior,
    neutralFocusBehavior,
    neutralOutlineFocusBehavior,
    forcedColorsStylesheetBehavior(
        css`
            :host(:${focusVisible}) {
                box-shadow: 0 0 0 calc(var(--focus-outline-width) * 1px) ${SystemColors.Highlight};
                color: ${SystemColors.ButtonText};
                forced-color-adjust: none;
            }
        `
    )
);
