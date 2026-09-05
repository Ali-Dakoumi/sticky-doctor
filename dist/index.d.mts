import * as react from 'react';
import { RefObject } from 'react';

type StickyDiagnosis = {
    isSticky: boolean;
    issues: string[];
};
declare function analyzeStickyElement(element: HTMLElement | null): StickyDiagnosis;

type Target = HTMLElement | null | RefObject<HTMLElement | null>;
type Props = {
    target: Target;
    title?: string;
    className?: string;
    onDiagnosis?: (result: StickyDiagnosis) => void;
};
declare function StickyDiagnosticOverlay({ target, title, className, onDiagnosis }: Props): react.JSX.Element;

export { type StickyDiagnosis, type StickyDiagnosis as StickyDiagnosisResult, StickyDiagnosticOverlay, analyzeStickyElement };
